import "../../../types/config.js";

declare module "../../../types/config.js" {
  export type SolidityUserConfig =
    | string
    | string[]
    | SolcUserConfig
    | MultiSolcUserConfig
    | SolidityBuildProfilesUserConfig;

  export interface SolcUserConfig {
    version: string;
    settings?: any;
  }

  export interface MultiSolcUserConfig {
    compilers: SolcUserConfig[];
    overrides?: Record<string, SolcUserConfig>;
  }

  export interface SolidityBuildProfilesUserConfig {
    profiles: Record<string, SolcUserConfig | MultiSolcUserConfig>;
  }

  export interface HardhatUserConfig {
    solidity?: SolidityUserConfig;
  }

  export interface SolcConfig {
    version: string;
    settings: any;
  }

  export interface SolidityBuildProfileConfig {
    compilers: SolcConfig[];
    overrides: Record<string, SolcConfig>;
  }

  export interface SolidityConfig {
    profiles: Record<string, SolidityBuildProfileConfig>;
  }

  export interface HardhatConfig {
    solidity: SolidityConfig;
  }

  export interface SourcePathsUserConfig {
    solidity?: string | string[];
  }

  export interface SourcePathsConfig {
    solidity: string | string[];
  }
}
