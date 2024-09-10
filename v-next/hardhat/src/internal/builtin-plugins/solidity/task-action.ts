import type { NewTaskActionFunction } from "../../../types/tasks.js";

import {
  emptyDir,
  getAllFilesMatching,
  remove,
} from "@ignored/hardhat-vnext-utils/fs";
import { getCacheDir } from "@ignored/hardhat-vnext-utils/global-dir";

interface CompileActionArguments {
  force: boolean;
}

const compileAction: NewTaskActionFunction<CompileActionArguments> = async (
  _taskArguments,
  { config },
) => {
  const localFilesToCompile = (
    await Promise.all(
      config.paths.sources.solidity.map((dir) =>
        getAllFilesMatching(dir, (f) => f.endsWith(".sol")),
      ),
    )
  ).flat(1);

  const solcVersionsToUse = new Set(
    Object.values(config.solidity.profiles)
      .map((profile) => [
        ...profile.compilers.map((compiler) => compiler.version),
        ...Object.values(profile.overrides).map((override) => override.version),
      ])
      .flat(1),
  );

  console.log({
    localFilesToCompile,
    dependenciesToCompile: config.solidity.dependenciesToCompile,
    solcVersionsToUse,
  });
};

export default compileAction;
