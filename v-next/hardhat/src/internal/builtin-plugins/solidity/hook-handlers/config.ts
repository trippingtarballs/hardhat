import type { ConfigHooks } from "../../../../types/hooks.js";

import path from "node:path";

import {
  resolveSolidityUserConfig,
  validateSolidityUserConfig,
} from "../config.js";

export default async (): Promise<Partial<ConfigHooks>> => {
  const handlers: Partial<ConfigHooks> = {
    validateUserConfig: validateSolidityUserConfig,
    resolveUserConfig: async (
      userConfig,
      resolveConfigurationVariable,
      next,
    ) => {
      const resolvedConfig = await next(
        userConfig,
        resolveConfigurationVariable,
      );

      return resolveSolidityUserConfig(userConfig, resolvedConfig);
    },
  };

  return handlers;
};
