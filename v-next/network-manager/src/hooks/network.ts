import type { NetworkConnection } from "../types.js";
import type { ChainType } from "@ignored/hardhat-vnext/types/config";
import type {
  HookContext,
  NetworkHooks,
} from "@ignored/hardhat-vnext/types/hooks";

export default async (): Promise<Partial<NetworkHooks>> => ({
  async newNetworkConnection<ChainTypeT extends ChainType | string>(
    context: HookContext,
    next: (nextContext: HookContext) => Promise<NetworkConnection<ChainTypeT>>,
  ): Promise<NetworkConnection<ChainTypeT>> {
    const connection = await next(context);

    console.log("newNetworkConnection", connection);

    return connection;
  },
  async closeConnection<ChainTypeT extends ChainType | string>(
    context: HookContext,
    networkConnection: NetworkConnection<ChainTypeT>,
    next: (
      nextContext: HookContext,
      nextNetworkConnection: NetworkConnection<ChainTypeT>,
    ) => Promise<void>,
  ): Promise<void> {
    await next(context, networkConnection);

    console.log("closeConnection", networkConnection);
  },
});
