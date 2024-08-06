import type {
  ConfigHooks,
  HardhatUserConfigValidationError,
} from "@ignored/hardhat-vnext/types/hooks";

import { isObject } from "@ignored/hardhat-vnext-utils/lang";
import {
  sensitiveStringType,
  validateUserConfigZodType,
} from "@ignored/hardhat-vnext-zod-utils";
import { z } from "zod";

const edrNetworkUserConfig = z.object({
  type: z.literal("edr"),
});

const httpNetworkUserConfig = z.object({
  type: z.literal("http"),
  url: sensitiveStringType,
});

const networkUserConfig = z.discriminatedUnion("type", [
  edrNetworkUserConfig,
  httpNetworkUserConfig,
]);

const hardhatUserConfig = z.object({
  networks: z.optional(z.record(networkUserConfig)),
});

export default async (): Promise<Partial<ConfigHooks>> => ({
  validateUserConfig: async (userConfig) => {
    const networks: Record<string, unknown> = userConfig.networks ?? {};

    const errors: HardhatUserConfigValidationError[] = [];

    for (const [name, network] of Object.entries(networks)) {
      if (!isObject(network)) {
        errors.push({
          path: ["networks", name],
          message: "Expected an object",
        });

        continue;
      }

      if (
        !("type" in network) ||
        (network.type !== "http" && network.type !== "edr")
      ) {
        errors.push({
          path: ["networks", name, "type"],
          message: `Expected "http" or "edr"`,
        });

        continue;
      }
    }

    if (errors.length > 0) {
      return errors;
    }

    return validateUserConfigZodType(userConfig, hardhatUserConfig);
  },
  async resolveUserConfig(userConfig, resolveConfigurationVariable, next) {
    const resolvedConfig = await next(userConfig, resolveConfigurationVariable);

    return {
      ...resolvedConfig,
      networks: {
        localhost: {
          type: "http",
          url: "http://localhost:8545",
          chainType: "l1",
          /* .... */
        },
        hardhat: {
          type: "edr",
          chainType: "l1",
        },
        optimismLocal: {
          type: "edr",
          chainType: "optimism",
        },
      },
    };
  },
});
