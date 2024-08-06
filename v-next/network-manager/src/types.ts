import type {
  ChainType,
  DefaultChainType,
  NetworkConfig,
} from "@ignored/hardhat-vnext/types/config";
import type EventEmitter from "node:events";

export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface NetworkConnection<ChainTypeT extends ChainType | string> {
  readonly networkName: string;
  readonly config: NetworkConfig;
  readonly chainType: ChainTypeT;
  readonly provider: Eip1193Provider;

  close(): Promise<void>;
}

export interface Eip1193Provider extends EventEmitter {
  request(args: RequestArguments): Promise<unknown>;
}

export interface NetworkManager {
  connect<ChainTypeT extends ChainType = DefaultChainType>(
    networkName?: string,
    chainType?: ChainTypeT,
  ): Promise<NetworkConnection<ChainTypeT>>;
}
