import { createHardhatRuntimeEnvironment } from "../index.js";
import { HardhatRuntimeEnvironment } from "../types/hre.js";
import { overrideTask, task } from "./config.js";
import {
  GlobalParameterIndex,
  buildGlobalParametersIndex,
} from "./global-params-index.js";
import { Config } from "./stubs.js";

const testTask = task("test", "Runs mocha tests")
  .addVariadicParam({
    name: "testFiles",
    description: "An optional list of files to test",
    defaultValue: [],
  })
  .addFlag({
    name: "noCompile",
    description: "Don't compile before running this task",
  })
  .addFlag({
    name: "parallel",
    description: "Run tests in parallel",
  })
  .addFlag({
    name: "bail",
    description: "Stop running tests after the first test failure",
    char: "b",
  })
  .addParam({
    name: "grep",
    description: "Only run tests matching the given string or regexp",
  })
  .setAction("file://asd")
  .build();

const testTaskOverride = overrideTask("test")
  .addFlag({
    name: "newFlag",
    description: "A new flag",
    char: "n",
  })
  .setAction(
    (taskArguments: {}, hre: HardhatRuntimeEnvironment, runSuper) => {},
  )
  .build();

async function cliMain(argv: string[]) {
  // TODO: load tsx

  let configPath: string | undefined;
  let showStackTraces: boolean = false; // true if ci
  let help: boolean = false;

  const processedArgvEntries = new Array(argv.length).fill(false);
  const flags = new Set<string>();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--config") {
      processedArgvEntries[i] = true;

      const configPath = argv[i + 1];
      i++;

      processedArgvEntries[i] = true;
      continue;
    }

    if (arg === "--show-stack-traces") {
      processedArgvEntries[i] = true;
      showStackTraces = true;
      continue;
    }

    if (arg === "--help") {
      processedArgvEntries[i] = true;
      help = true;
      continue;
    }

    if (arg[0] === "-" && arg[1] !== "-") {
      processedArgvEntries[i] = true;
      for (let j = 1; j < arg.length; j++) {
        flags.add(arg[j]);
      }
    }
  }

  if (configPath === undefined) {
    // TODO: Find the closest config file
    throw new Error("Missing --config");
  } else {
    // TODO: Import the config file
  }

  const config: Config = {};

  const globalParamsIndex = buildGlobalParametersIndex(config);
  const { arguments: cliGlobalArguments, usedFlags } = parseGlobalParams(
    argv,
    flags,
    globalParamsIndex,
    processedArgvEntries,
  );

  const hre = await createHardhatRuntimeEnvironment(config, cliGlobalParams);

  const { taskId, taskArguments } = parseTaskAndArguments(
    argv,
    processedArgvEntries,
    flags,
    hre,
  );

  // If the task doesn't collect unrecognized arguments, check if there are unprocessed argv entries, or unsued flags, throw
}

function parseGlobalParams(
  argv: string[],
  flags: Set<string>,
  globalParamsIndex: GlobalParameterIndex,
  processedArgvEntries: boolean[],
): { arguments: Record<string, any>; usedFlags: Set<string> } {
  // - Parse the global params and flags, skipping the processed entries
  // - Check if any global flag is present
  // - At each stage validate the value according to its type
  // - Mark all the used entries in processedArgvEntries
  // - Return the values
  return {};
}

function parseTaskAndArguments(
  argv: string[],
  processedArgvEntries: boolean[],
  flags: Set<string>,
  hre: HardhatRuntimeEnvironment,
): {
  taskId: string[];
  taskArguments: Record<string, any>;
  usedFlags: Set<string>;
} {
  // How to pick the task:
  //
  // The first non-processed entry is the task name
  // If the immediately following entry doesn't start with `-` it can be the name of a subtask
  //   We check if the subtask exists, and if it does, we prioritize this case, checking if the subtask itself has a subtask.
  //   If the subtask doesn't exist, we treat it as a positional/variadic param

  // Once we have the task:
  // - Parse its arguments, skipping the processed entries
  // - Validate each argument value
  // - Check if the task has any flag that is used

  // - Check if the task is valid
  // - Check if the task is overridden
  // - Check if the task has any flag that is a global flag
  // - At each stage validate the value according to its type
  // - Mark all the used entries in processedArgvEntries
  // - Return the values
  return { taskId: [], taskArguments: {} };
}
// Implementation pseudocode:
//  1. Create a map of global parameters, validating them as we go
//  2. Create a map of task entries, validating them as we go
//  3. Validate task parameter's value
//  4. Run a task
//  5. Handler runSuper
//  6. Parse CLI arguments -- How can we avoid doing 1 and 2 twice? We need them internally in the HRE and also for parsing.
//  7. Improve the `setAction` types
