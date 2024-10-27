import type { RunOptions } from "./runner.js";
import type { TestEvent } from "./types.js";
import type { NewTaskActionFunction } from "../../../types/tasks.js";

import { finished } from "node:stream/promises";

import { buildSolidityTestsInput } from "./helpers.js";
import { testReporter } from "./reporter.js";
import { run } from "./runner.js";

interface TestActionArguments {
  timeout: number;
  noCompile: boolean;
}

const runSolidityTests: NewTaskActionFunction<TestActionArguments> = async (
  { timeout, noCompile },
  hre,
) => {
  if (!noCompile) {
    await hre.tasks.getTask("compile").run({ quiet: true });
  }

  const { artifacts, testSuiteIds } = await buildSolidityTestsInput(
    hre.artifacts,
    (artifact) => {
      const sourceName = artifact.id.source;
      const isTestArtifact =
        sourceName.endsWith(".t.sol") &&
        sourceName.startsWith("contracts/") &&
        !sourceName.startsWith("contracts/forge-std/") &&
        !sourceName.startsWith("contracts/ds-test/");

      return isTestArtifact;
    },
  );

  const config = {
    projectRoot: hre.config.paths.root,
  };

  let includesFailures = false;
  let includesErrors = false;

  const options: RunOptions = { timeout };

  const runStream = run(artifacts, testSuiteIds, config, options);

  const testReporterStream = runStream
    .on("data", (event: TestEvent) => {
      if (event.type === "suite:result") {
        if (event.data.testResults.some(({ status }) => status === "Failure")) {
          includesFailures = true;
        }
      }
    })
    .compose(testReporter);

  testReporterStream.pipe(process.stdout);

  try {
    // NOTE: We're awaiting the original run stream to finish to catch any
    // errors produced by the runner.
    await finished(runStream);

    // We also await the test reporter stream to finish to catch any error, and
    // to avoid returning before the whole output was generated.
    //
    // NOTE: We don't await the restult of piping it to stdout, as that is
    // ignored.
    await finished(testReporterStream);
  } catch (error) {
    console.error(error);
    includesErrors = true;
  }

  if (includesFailures || includesErrors) {
    process.exitCode = 1;
    return;
  }
};

export default runSolidityTests;
