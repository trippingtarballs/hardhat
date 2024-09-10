import type { HardhatUserConfig } from "../../../config.js";
import type {
  HardhatConfig,
  SolidityBuildProfileConfig,
  SolidityConfig,
  SolidityUserConfig,
} from "../../../types/config.js";
import type { HardhatUserConfigValidationError } from "../../../types/hooks.js";

import { isObject } from "@ignored/hardhat-vnext-utils/lang";
import { resolveFromRoot } from "@ignored/hardhat-vnext-utils/path";
import {
  conditionalUnionType,
  unexpectedFieldType,
  validateUserConfigZodType,
} from "@ignored/hardhat-vnext-zod-utils";
import { z } from "zod";

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

const multiVersionSolcUserConfigType = z.object({
  compilers: z.array(solcUserConfigType).nonempty(),
  overrides: z.record(z.string(), solcUserConfigType).optional(),
});

const singleVersionSolidityUserConfigType = solcUserConfigType.extend({
  dependenciesToCompile: z.array(z.string()).optional(),
  compilers: unexpectedFieldType("This field is incompatible with `version`"),
  profiles: unexpectedFieldType("This field is incompatible with `version`"),
});

const multiVersionSolidityUserConfigType =
  multiVersionSolcUserConfigType.extend({
    dependenciesToCompile: z.array(z.string()).optional(),
    version: unexpectedFieldType("This field is incompatible with `compilers`"),
    profiles: unexpectedFieldType(
      "This field is incompatible with `compilers`",
    ),
  });

const buildProfilesSolidityUserConfigType = z.object({
  profiles: z.record(
    z.string(),
    conditionalUnionType(
      [
        [(data) => isObject(data) && "version" in data, solcUserConfigType],
        [
          (data) => isObject(data) && "compilers" in data,
          multiVersionSolcUserConfigType,
        ],
      ],
      "Expected an object configuring one or more versions of Solidity",
    ),
  ),
  dependenciesToCompile: z.array(z.string()).optional(),
  version: unexpectedFieldType("This field is incompatible with `profiles`"),
  compilers: unexpectedFieldType("This field is incompatible with `profiles`"),
});

const soldityUserConfigType = conditionalUnionType(
  [
    [(data) => typeof data === "string", z.string()],
    [(data) => Array.isArray(data), z.array(z.string()).nonempty()],
    [
      (data) => isObject(data) && "version" in data,
      singleVersionSolidityUserConfigType,
    ],
    [
      (data) => isObject(data) && "compilers" in data,
      multiVersionSolidityUserConfigType,
    ],
    [
      (data) => isObject(data) && "profiles" in data,
      buildProfilesSolidityUserConfigType,
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

export function validateSolidityUserConfig(
  userConfig: unknown,
): HardhatUserConfigValidationError[] {
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
    solidity: resolveSolidityConfig(userConfig.solidity ?? "0.8.0"),
  };
}

function resolveSolidityConfig(
  solidityConfig: SolidityUserConfig,
): SolidityConfig {
  if (typeof solidityConfig === "string") {
    solidityConfig = [solidityConfig];
  }

  if (Array.isArray(solidityConfig)) {
    return {
      profiles: {
        default: {
          compilers: solidityConfig.map((version) => ({
            version,
            settings: {},
          })),
          overrides: {},
        },
      },
    };
  }

  if ("version" in solidityConfig) {
    return {
      profiles: {
        default: {
          compilers: [
            {
              version: solidityConfig.version,
              settings: solidityConfig.settings ?? {},
            },
          ],
          overrides: {},
        },
      },
    };
  }

  if ("compilers" in solidityConfig) {
    return {
      profiles: {
        default: {
          compilers: solidityConfig.compilers.map((compiler) => ({
            version: compiler.version,
            settings: compiler.settings ?? {},
          })),
          overrides: {},
        },
      },
    };
  }

  const profiles: Record<string, SolidityBuildProfileConfig> = {};

  for (const [profileName, profile] of Object.entries(
    solidityConfig.profiles,
  )) {
    if ("version" in profile) {
      profiles[profileName] = {
        compilers: [
          {
            version: profile.version,
            settings: profile.settings ?? {},
          },
        ],
        overrides: {},
      };
      continue;
    }

    profiles[profileName] = {
      compilers: profile.compilers.map((compiler) => ({
        version: compiler.version,
        settings: compiler.settings ?? {},
      })),
      overrides: {},
    };
  }

  // TODO: Maybe make this required?
  if (!("default" in solidityConfig)) {
    profiles.default = {
      compilers: [
        {
          version: "0.8.0",
          settings: {},
        },
      ],
      overrides: {},
    };
  }

  return {
    profiles,
  };
}
