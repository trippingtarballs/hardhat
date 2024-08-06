import type {
  Eip1193Provider,
  NetworkConnection,
  NetworkManager,
} from "./types.js";
import type {
  ChainType,
  DefaultChainType,
  NetworkConfig,
} from "@ignored/hardhat-vnext/types/config";
import type {
  HookContext,
  HookManager,
} from "@ignored/hardhat-vnext/types/hooks";

export class NetworkManagerImplementation implements NetworkManager {
  readonly #defaultNetwork: string;
  readonly #defaultChainType: DefaultChainType;
  readonly #networkConfig: Record<string, NetworkConfig>;
  readonly #hookManager: HookManager;

  constructor(
    defaultNetwork: string,
    defaultChainType: DefaultChainType,
    networkConfig: Record<string, NetworkConfig>,
    hoookManager: HookManager,
  ) {
    this.#networkConfig = networkConfig;
    this.#hookManager = hoookManager;
    this.#defaultNetwork = defaultNetwork;
    this.#defaultChainType = defaultChainType;
  }

  public async connect<ChainTypeT extends ChainType = DefaultChainType>(
    networkName?: string,
    chainType?: ChainTypeT,
  ): Promise<NetworkConnection<ChainTypeT>> {
    const networkConnection = await this.#hookManager.runHandlerChain(
      "network",
      "newNetworkConnection",
      [],
      async (_nextContext: HookContext) =>
        this.#initializeNetworkConnection(networkName, chainType),
    );

    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
    We know that the network connection is a NetworkConnection<ChainTypeT>, but
    typescript gets lost. */
    return networkConnection as NetworkConnection<ChainTypeT>;
  }

  async #initializeNetworkConnection<
    ChainTypeT extends ChainType = DefaultChainType,
  >(
    networkName?: string,
    chainType?: ChainTypeT,
  ): Promise<NetworkConnection<ChainTypeT>> {
    const name = networkName ?? this.#defaultNetwork;

    // TODO: If the network type is HTTP or EDR we do different things here.
    return new NetworkConnectionImplementation(
      this.#hookManager,
      name,
      this.#networkConfig[name],
      chainType ?? (this.#defaultChainType as ChainTypeT),
      {} as Eip1193Provider,
    );
  }
}

export class NetworkConnectionImplementation<
  ChainTypeT extends ChainType | string,
> implements NetworkConnection<ChainTypeT>
{
  readonly #hookManager: HookManager;

  public readonly networkName: string;
  public readonly config: NetworkConfig;
  public readonly chainType: ChainTypeT;
  public readonly provider: Eip1193Provider;

  constructor(
    hookManager: HookManager,
    networkName: string,
    config: NetworkConfig,
    chainType: ChainTypeT,
    provider: Eip1193Provider,
  ) {
    this.#hookManager = hookManager;
    this.networkName = networkName;
    this.config = config;
    this.chainType = chainType;
    this.provider = provider;

    this.close = this.close.bind(this);
  }

  public async close(): Promise<void> {
    await this.#hookManager.runHandlerChain(
      "network",
      "closeConnection",
      [this],
      async (
        _context: HookContext,
        _connection: NetworkConnection<string>,
      ) => {},
    );
  }
}
