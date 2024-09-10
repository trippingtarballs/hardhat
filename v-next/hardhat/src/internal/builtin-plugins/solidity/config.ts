import type { HardhatUserConfig } from "../../../config.js";
import type { HardhatConfig } from "../../../types/config.js";
import type { HardhatUserConfigValidationError } from "@ignored/hardhat-vnext-zod-utils";

import path from "node:path";

import { isObject } from "@ignored/hardhat-vnext-utils/lang";
import {
  conditionalUnionType,
  validateUserConfigZodType,
} from "@ignored/hardhat-vnext-zod-utils";
import { z } from "zod";
import { resolveFromRoot } from "@ignored/hardhat-vnext-utils/path";

const sourcePathsType = conditionalUnionType(
  [
    [(data) => typeof data === "string", z.string()],
    [(data) => Array.isArray(data), z.array(z.string()).nonempty()],
  ],
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
    conditionalUnionType(
      [
        [(data) => isObject(data) && "version" in data, solcUserConfigType],
        [
          (data) => isObject(data) && "compilers" in data,
          multiSolcUserConfigType,
        ],
      ],
      "Expected an object configuring one or more versions of Solidity",
    ),
  ),
});

const soldityUserConfigType = conditionalUnionType(
  [
    [(data) => typeof data === "string", z.string()],
    [(data) => Array.isArray(data), z.array(z.string()).nonempty()],
    [(data) => isObject(data) && "version" in data, solcUserConfigType],
    [(data) => isObject(data) && "compilers" in data, multiSolcUserConfigType],
    [
      (data) => isObject(data) && "profiles" in data,
      solidityBuildProfileUserConfigType,
    ],
  ],
  "Expected a version string, an array of version strings, or an object cofiguring one or more versions of Solidity or multiple build profiles",
);

const userConfigType = z.object({
  paths: z
    .object({
      sources: conditionalUnionType(
        [
          [isObject, z.object({ solidity: sourcePathsType.optional() })],
          [
            (data) => typeof data === "string" || Array.isArray(data),
            sourcePathsType,
          ],
        ],
        "Expected a string, an array of strings, or an object with an optional 'solidity' property",
      ).optional(),
    })
    .optional(),
  solidity: soldityUserConfigType.optional(),
});

export async function validateSolidityUserConfig(
  userConfig: unknown,
): Promise<HardhatUserConfigValidationError[]> {
  // TODO: Manually validate that there are not type clashes between the
  // different types of user configs
  return validateUserConfigZodType(userConfig, userConfigType);
}

export async function resolveSolidityUserConfig(
  userConfig: HardhatUserConfig,
  resolvedConfig: HardhatConfig,
): Promise<HardhatConfig> {
  let sourcesPaths = userConfig.paths?.sources;

  // TODO: use isObject when the type narrowing issue is fixed
  sourcesPaths =
    typeof sourcesPaths === "object" && !Array.isArray(sourcesPaths)
      ? sourcesPaths.solidity
      : sourcesPaths;

  sourcesPaths ??= "contracts";

  sourcesPaths = Array.isArray(sourcesPaths) ? sourcesPaths : [sourcesPaths];

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
}
