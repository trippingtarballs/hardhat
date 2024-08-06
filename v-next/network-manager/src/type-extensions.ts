import "@ignored/hardhat-vnext/types/config";

declare module "@ignored/hardhat-vnext/types/config" {
  export type DefaultChainType = ChainTypeConfig extends {
    defaultChainType: infer T;
  }
    ? T extends ChainType
      ? T
      : "unknown"
    : "unknown";

  /* eslint-disable-next-line @typescript-eslint/no-empty-interface -- Empty
  interface to allow the user to extend the default chain type. */
  export interface ChainTypeConfig {
    // Define the type defaultChainType as one of the chain types to customize
    // the default type use when no chainType is used to connect to a network.
    // If not defined, the default type is "unknown".
    // defaultChainType: "unknown";
  }

  export interface HardhatUserConfig {
    defaultNetwork?: string;
    defaultChainType?: DefaultChainType;
    networks?: Record<string, NetworkUserConfig>;
  }

  export interface HardhatConfig {
    defaultNetwork: string;
    defaultChainType: DefaultChainType;
    networks: Record<string, NetworkConfig>;
  }

  export type NetworkUserConfig = HttpNetworkUserConfig | EdrNetworkUserConfig;

  // We use | string here because we want to add new chain types in the future
  export type ChainType = "unknown" | "l1" | "optimism";

  export interface HttpNetworkUserConfig {
    type: "http";
    chainType?: ChainType;
    chainId?: number;
    from?: string;
    gas?: "auto" | number;
    gasPrice?: "auto" | number;
    gasMultiplier?: number;

    // HTTP network specific
    url?: string;
    timeout?: number;
    httpHeaders?: { [name: string]: string };
  }

  export interface EdrNetworkUserConfig {
    type: "edr";
    chainType?: ChainType;
    chainId: number;
    from?: string;
    gas: "auto" | number;
    gasPrice: "auto" | number;
    gasMultiplier: number;

    // EDR network specific
  }

  export type NetworkConfig = HttpNetworkConfig | EdrNetworkConfig;

  export interface HttpNetworkConfig {
    type: "http";
    chainType: ChainType;
    chainId: number;
    from?: string;
    gas: "auto" | number;
    gasPrice: "auto" | number;
    gasMultiplier: number;

    // HTTP network specific
    url: string;
    timeout: number;
    httpHeaders: { [name: string]: string };
  }

  export interface EdrNetworkConfig {
    type: "edr";
    chainType: ChainType;
    chainId: number;
    from: string;
    gas: "auto" | number;
    gasPrice: "auto" | number;
    gasMultiplier: number;

    // EDR network specific
  }
}

import type { NetworkConnection, NetworkManager } from "./types.js";
import type { ChainType } from "@ignored/hardhat-vnext/types/config";
import type { HookContext } from "@ignored/hardhat-vnext/types/hooks";

declare module "@ignored/hardhat-vnext/types/hooks" {
  export interface HardhatHooks {
    network: NetworkHooks;
  }

  export interface NetworkHooks {
    newNetworkConnection<ChainTypeT extends ChainType | string>(
      context: HookContext,
      next: (
        nextContext: HookContext,
      ) => Promise<NetworkConnection<ChainTypeT>>,
    ): Promise<NetworkConnection<ChainTypeT>>;

    closeConnection<ChainTypeT extends ChainType | string>(
      context: HookContext,
      networkConnection: NetworkConnection<ChainTypeT>,
      next: (
        nextContext: HookContext,
        nextNetworkConnection: NetworkConnection<ChainTypeT>,
      ) => Promise<void>,
    ): Promise<void>;
  }
}

import "@ignored/hardhat-vnext/types/hre";
declare module "@ignored/hardhat-vnext/types/hre" {
  export interface HardhatRuntimeEnvironment {
    network: NetworkManager;
  }
}

import "@ignored/hardhat-vnext/types/global-options";
declare module "@ignored/hardhat-vnext/types/global-options" {
  export interface GlobalOptions {
    network: string;
  }
}
