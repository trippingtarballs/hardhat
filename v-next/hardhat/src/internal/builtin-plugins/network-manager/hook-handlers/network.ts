import type {
  EthereumProvider,
  JsonRpcRequest,
  JsonRpcResponse,
} from "../../../../types/providers.js";
import type {
  HookContext,
  NetworkHooks,
} from "@ignored/hardhat-vnext/types/hooks";
import type {
  ChainType,
  NetworkConnection,
} from "@ignored/hardhat-vnext/types/network";

import { getRequestParams, isJsonRpcResponse } from "../json-rpc.js";
import {
  assertHardhatInvariant,
  HardhatError,
} from "@ignored/hardhat-vnext-errors";
import { hexStringToNumber } from "@ignored/hardhat-vnext-utils/hex";
import { json } from "stream/consumers";
import { assert } from "console";
import { JsonRpcTransactionData } from "../json-rpc-request-modifiers/accounts/types.js";

/**
 * Commmon interface for request handlers, which can either return a new
 * modified request, or a response.
 *
 * If they return a request, it's passed to the next handler, or to the `next`
 * function if there are no more handlers.
 *
 * If they return a response, it's returned immediately.
 *
 * These are easy to test individually.
 */
interface RequestHandler {
  handle(
    jsonRpcRequest: JsonRpcRequest,
  ): Promise<JsonRpcRequest | JsonRpcResponse>;
}

/**
 * Example of a request handler that validates the chain id.
 */
class ChainIdValidatorHandler implements RequestHandler {
  readonly #provider: EthereumProvider;
  readonly #expectedChainId: number;

  constructor(provider: EthereumProvider, expectedChainId: number) {
    this.#provider = provider;
    this.#expectedChainId = expectedChainId;
  }

  public async handle(
    jsonRpcRequest: JsonRpcRequest,
  ): Promise<JsonRpcRequest | JsonRpcResponse> {
    if (jsonRpcRequest.method === "eth_chainId") {
      return jsonRpcRequest;
    }

    // TODO: Cache and share this
    const chainIdResponse = await this.#provider.request({
      method: "eth_chainId",
    });
    assertHardhatInvariant(
      typeof chainIdResponse === "string",
      "chainId should be a string",
    );

    const chainId = hexStringToNumber(chainIdResponse);

    if (chainId !== this.#expectedChainId) {
      throw new HardhatError(
        HardhatError.ERRORS.NETWORK.INVALID_GLOBAL_CHAIN_ID,
        {
          configChainId: this.#expectedChainId,
          connectionChainId: chainId,
        },
      );
    }

    return jsonRpcRequest;
  }
}

// Another example, this one does modify the request.
class FixedGasHandler implements RequestHandler {
  readonly #gas: bigint;

  constructor(gas: bigint) {
    this.#gas = gas;
  }

  public async handle(
    jsonRpcRequest: JsonRpcRequest,
  ): Promise<JsonRpcRequest | JsonRpcResponse> {
    if (jsonRpcRequest.method !== "eth_sendTransaction") {
      return jsonRpcRequest;
    }

    // Maybe this isn't the best way to do this?
    assertHardhatInvariant(
      Array.isArray(jsonRpcRequest.params),
      "params should be an array",
    );

    const tx: JsonRpcTransactionData = jsonRpcRequest.params[0];

    return {
      ...jsonRpcRequest,
      // This should be turned into a jsonRpcQuantity
      params: [{ gasPrice: this.#gas, ...tx }],
    };
  }
}

// An example that just returns a reponse. This one is less realistic, as in
// we don't need this behavior.
class LocalAccountsHandler implements RequestHandler {
  #accounts: string[];

  constructor(accounts: string[]) {
    this.#accounts = accounts;
  }

  public async handle(
    jsonRpcRequest: JsonRpcRequest,
  ): Promise<JsonRpcRequest | JsonRpcResponse> {
    if (jsonRpcRequest.method !== "eth_accounts") {
      return jsonRpcRequest;
    }

    return {
      jsonrpc: "2.0",
      id: jsonRpcRequest.id,
      result: this.#accounts,
    };
  }
}

// This is all you need to read to understand which handlers are run and in
// what order.
//
// Can be tested in isolation, just to make sure taht they are run in the right,
// under the right circustances, making the tests easier to write and maintain,
// instead of relying on e2e tests that get fragile.
function createHandlersArray<ChainTypeT extends ChainType | string>(
  networkConnection: NetworkConnection<ChainTypeT>,
): RequestHandler[] {
  const requestHandlers = [];

  if (networkConnection.networkConfig.type === "http") {
    if (networkConnection.networkConfig.chainId !== undefined) {
      requestHandlers.push(
        new ChainIdValidatorHandler(
          networkConnection.provider,
          networkConnection.networkConfig.chainId,
        ),
      );
    }

    if (typeof networkConnection.networkConfig.gas === "bigint") {
      requestHandlers.push(
        new FixedGasHandler(networkConnection.networkConfig.gas),
      );
    }
  }

  return requestHandlers;
}

export default async (): Promise<Partial<NetworkHooks>> => {
  const requestHandlersPerConnection: Map<
    number,
    Array<RequestHandler>
  > = new Map();

  const handlers: Partial<NetworkHooks> = {
    async onRequest<ChainTypeT extends ChainType | string>(
      context: HookContext,
      networkConnection: NetworkConnection<ChainTypeT>,
      jsonRpcRequest: JsonRpcRequest,
      next: (
        nextContext: HookContext,
        nextNetworkConnection: NetworkConnection<ChainTypeT>,
        nextJsonRpcRequest: JsonRpcRequest,
      ) => Promise<JsonRpcResponse>,
    ) {
      let requestHandlers = requestHandlersPerConnection.get(
        networkConnection.id,
      );

      if (requestHandlers === undefined) {
        requestHandlers = createHandlersArray(networkConnection);
        requestHandlersPerConnection.set(networkConnection.id, requestHandlers);
      }

      let request = jsonRpcRequest;
      for (const handler of requestHandlers) {
        const newRequestOrResponse = await handler.handle(request);
        if (isJsonRpcResponse(newRequestOrResponse)) {
          return newRequestOrResponse;
        }

        request = newRequestOrResponse;
      }

      return next(context, networkConnection, request);
    },

    async closeConnection<ChainTypeT extends ChainType | string>(
      context: HookContext,
      networkConnection: NetworkConnection<ChainTypeT>,
      next: (
        nextContext: HookContext,
        nextNetworkConnection: NetworkConnection<ChainTypeT>,
      ) => Promise<void>,
    ): Promise<void> {
      if (requestHandlersPerConnection.has(networkConnection.id) === true) {
        requestHandlersPerConnection.delete(networkConnection.id);
      }

      return next(context, networkConnection);
    },
  };

  return handlers;
};
