import type { ChainType, DefaultChainType } from "../../../../types/network.js";

import "../../../../types/config.js";
declare module "../../../../types/config.js" {
  export interface HardhatUserConfig {
    defaultChainType?: DefaultChainType;
    defaultNetwork?: string;
    networks?: Record<string, NetworkUserConfig>;
  }

  export interface HardhatConfig {
    defaultChainType: DefaultChainType;
    defaultNetwork: string;
    networks: Record<string, NetworkConfig>;
  }

  export type NetworkUserConfig = HttpNetworkUserConfig | EdrNetworkUserConfig;

  export type GasUserConfig = "auto" | number | bigint;

  export interface HttpNetworkUserConfig {
    type: "http";
    chainId?: number;
    chainType?: ChainType;
    from?: string;
    gas?: GasUserConfig;
    gasMultiplier?: number;
    gasPrice?: GasUserConfig;
    accounts?: HttpNetworkAccountsUserConfig;

    // HTTP network specific
    url: SensitiveString;
    timeout?: number;
    httpHeaders?: Record<string, string>;
  }

  export type HttpNetworkAccountsUserConfig =
    | REMOTE
    | SensitiveString[]
    | HDAccountsUserConfig;

  export interface HDAccountsUserConfig {
    mnemonic: SensitiveString;
    initialIndex?: number;
    count?: number;
    path?: string;
    passphrase?: SensitiveString;
  }

  export type IntervalMiningConfig = number | [number, number];

  export type MempoolOrder = "fifo" | "priority";

  /**
   * Map<HardforkName, BlockNumber>
   */
  export type HardforkHistoryConfig = Map<string, number>;

  export interface HardhatNetworkChainConfig {
    hardforkHistory: HardforkHistoryConfig;
  }

  /*
   * Map<ChainId, HardhatNetworkChainConfig>
   */
  export type HardhatNetworkChainsConfig = Map<
    number,
    HardhatNetworkChainConfig
  >;

  export interface GenesisAccount {
    privateKey: string;
    balance: string | number | bigint;
  }

  export interface EdrNetworkUserConfig {
    type: "edr";
    chainId?: number;
    chainType?: ChainType;
    from?: string;
    gas?: GasUserConfig;
    gasMultiplier?: number;
    gasPrice?: GasUserConfig;
    accounts?: EdrNetworkAccountsUserConfig;

    // EDR network specific
    hardfork?: string;
    networkId?: number;
    blockGasLimit?: number;
    minGasPrice?: bigint;
    automine?: boolean;
    intervalMining?: IntervalMiningConfig;
    mempoolOrder?: MempoolOrder;
    chains?: HardhatNetworkChainsConfig;
    genesisAccounts?: GenesisAccount[];
    allowUnlimitedContractSize?: boolean;
    throwOnTransactionFailures?: boolean;
    throwOnCallFailures?: boolean;
    allowBlocksWithSameTimestamp?: boolean;
    enableTransientStorage?: boolean;
    enableRip7212?: boolean;
    initialBaseFeePerGas?: number;
    initialDate?: Date;
    coinbase?: string;
    // TODO: This isn't how it's called in v2
    forkConfig?: ForkUserConfig;
    // TODO: This isn't configurable in v2
    forkCachePath?: string;
  }

  export interface ForkUserConfig {
    jsonRpcUrl: SensitiveString;
    blockNumber?: bigint;
    httpHeaders?: Record<string, string>;
  }

  export type EdrNetworkAccountsUserConfig =
    | EdrNetworkAccountUserConfig[]
    | EdrNetworkHDAccountsUserConfig;

  export interface EdrNetworkAccountUserConfig {
    privateKey: SensitiveString;
    balance: string;
  }

  export interface EdrNetworkHDAccountsUserConfig {
    mnemonic?: SensitiveString;
    initialIndex?: number;
    count?: number;
    path?: string;
    accountsBalance?: string;
    passphrase?: SensitiveString;
  }

  export type NetworkConfig = HttpNetworkConfig | EdrNetworkConfig;

  export type GasConfig = "auto" | bigint;

  export interface HttpNetworkConfig {
    type: "http";
    chainId?: number;
    chainType?: ChainType;
    from?: string;
    gas: GasConfig;
    gasMultiplier: number;
    gasPrice: GasConfig;
    accounts: HttpNetworkAccountsConfig;

    // HTTP network specific
    url: ResolvedConfigurationVariable;
    timeout: number;
    httpHeaders: Record<string, string>;
  }

  export type REMOTE = "remote";

  export type HttpNetworkAccountsConfig =
    | REMOTE
    | ResolvedConfigurationVariable[]
    | HttpNetworkHDAccountsConfig;

  export interface HttpNetworkHDAccountsConfig {
    mnemonic: ResolvedConfigurationVariable;
    initialIndex: number;
    count: number;
    path: string;
    passphrase: ResolvedConfigurationVariable;
  }

  export interface EdrNetworkConfig {
    type: "edr";
    chainId: number;
    chainType?: ChainType;
    from?: string;
    gas: GasConfig;
    gasMultiplier: number;
    gasPrice: GasConfig;
    // TODO: make this required and resolve the accounts in the config hook handler
    accounts?: EdrNetworkAccountsConfig;

    // EDR network specific
    hardfork: string;
    networkId: number;
    blockGasLimit: number;
    minGasPrice: bigint;
    automine: boolean;
    intervalMining: IntervalMiningConfig;
    mempoolOrder: MempoolOrder;
    chains: HardhatNetworkChainsConfig;
    genesisAccounts: GenesisAccount[];
    allowUnlimitedContractSize: boolean;
    throwOnTransactionFailures: boolean;
    throwOnCallFailures: boolean;
    allowBlocksWithSameTimestamp: boolean;
    enableTransientStorage: boolean;
    enableRip7212: boolean;

    initialBaseFeePerGas?: number;
    initialDate?: Date;
    coinbase?: string;
    forkConfig?: ForkConfig;
    forkCachePath: string;
  }

  export interface ForkConfig {
    jsonRpcUrl: ResolvedConfigurationVariable;
    blockNumber?: bigint;
    httpHeaders?: Record<string, string>;
  }

  export type EdrNetworkAccountsConfig =
    | EdrNetworkHDAccountsConfig
    | EdrNetworkAccountConfig[];

  export interface EdrNetworkAccountConfig {
    privateKey: ResolvedConfigurationVariable;
    balance: string;
  }

  export interface EdrNetworkHDAccountsConfig {
    mnemonic: ResolvedConfigurationVariable;
    initialIndex: number;
    count: number;
    path: string;
    accountsBalance: string;
    passphrase: ResolvedConfigurationVariable;
  }
}
