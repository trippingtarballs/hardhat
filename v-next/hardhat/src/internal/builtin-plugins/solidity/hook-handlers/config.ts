import type { ConfigHooks } from "../../../../types/hooks.js";

import { resolveFromRoot } from "@ignored/hardhat-vnext-utils/path";
import {
  unionType,
  validateUserConfigZodType,
} from "@ignored/hardhat-vnext-zod-utils";
import { z } from "zod";

const sourcePathsType = unionType(
  [z.string(), z.array(z.string()).nonempty()],
  "Expected a string or an array of strings",
);

const solcUserConfigType = z.object({
  version: z.string(),
  settings: z.any().optional(),
});

const multiSolcUserConfigType = z.object({
  compilers: z.array(solcUserConfigType).nonempty(),
  overrides: z.record(solcUserConfigType).optional(),
});

const solidityBuildProfileUserConfigType = z.object({
  profiles: z.record(
    unionType(
      [solcUserConfigType, multiSolcUserConfigType],
      "Expected an object configuring one or more versions of Solidity",
    ),
  ),
});

const soldityUserConfigType = unionType(
  [
    z.string(),
    z.array(z.string()).nonempty(),
    solcUserConfigType,
    multiSolcUserConfigType,
    solidityBuildProfileUserConfigType,
  ],
  "Expected a version string, an array of version strings, or an object cofiguring one or more versions of Solidity or multiple build profiles",
);

const userConfigType = z.object({
  paths: z
    .object({
      sources: unionType(
        [sourcePathsType, z.object({ solidity: sourcePathsType.optional() })],
        "Expected a string, an array of strings, or an object with an optional 'solidity' property",
      ).optional(),
    })
    .optional(),
  solidity: soldityUserConfigType.optional(),
});

export default async (): Promise<Partial<ConfigHooks>> => {
  const handlers: Partial<ConfigHooks> = {
    validateUserConfig: async (userConfig) => {
      // TODO: Manually validate that there are not type clashes between the
      // different types of user configs
      return validateUserConfigZodType(userConfig, userConfigType);
    },
    resolveUserConfig: async (
      userConfig,
      resolveConfigurationVariable,
      next,
    ) => {
      const resolvedConfig = await next(
        userConfig,
        resolveConfigurationVariable,
      );

      let sourcesPaths = userConfig.paths?.sources;

      // TODO: use isObject when the type narrowing issue is fixed
      sourcesPaths =
        typeof sourcesPaths === "object" && !Array.isArray(sourcesPaths)
          ? sourcesPaths.solidity
          : sourcesPaths;

      sourcesPaths ??= "contracts";

      sourcesPaths = Array.isArray(sourcesPaths)
        ? sourcesPaths
        : [sourcesPaths];

      const resolvedPaths = sourcesPaths.map((p) =>
        resolveFromRoot(resolvedConfig.paths.root, p),
      );

      return {
        ...resolvedConfig,
        paths: {
          ...resolvedConfig.paths,
          sources: {
            ...resolvedConfig.paths.sources,
            solidity: resolvedPaths,
          },
        },
      };
    },
  };

  return handlers;
};
