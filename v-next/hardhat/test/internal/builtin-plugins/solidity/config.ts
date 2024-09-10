import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateSolidityUserConfig } from "../../../../src/internal/builtin-plugins/solidity/config.js";

describe.only("solidity plugin config validation", () => {
  describe("sources paths", () => {
    it("Should reject invalid values in `config.paths.sources`", async () => {
      assert.deepEqual(
        await validateSolidityUserConfig({
          paths: {
            sources: 123,
          },
        }),
        [
          {
            message:
              "Expected a string, an array of strings, or an object with an optional 'solidity' property",
            path: ["paths", "sources"],
          },
        ],
      );

      assert.deepEqual(
        await validateSolidityUserConfig({
          paths: {
            sources: [],
          },
        }),
        [
          {
            message: "Array must contain at least 1 element(s)",
            path: ["paths", "sources"],
          },
        ],
      );

      assert.deepEqual(
        await validateSolidityUserConfig({
          paths: {
            sources: {
              solidity: 123,
            },
          },
        }),
        [
          {
            message: "Expected a string or an array of strings",
            path: ["paths", "sources", "solidity"],
          },
        ],
      );

      assert.deepEqual(
        await validateSolidityUserConfig({
          paths: {
            sources: {
              solidity: {},
            },
          },
        }),
        [
          {
            message: "Expected a string or an array of strings",
            path: ["paths", "sources", "solidity"],
          },
        ],
      );

      assert.deepEqual(
        await validateSolidityUserConfig({
          paths: {
            sources: {
              solidity: [],
            },
          },
        }),
        [
          {
            message: "Array must contain at least 1 element(s)",
            path: ["paths", "sources", "solidity"],
          },
        ],
      );
    });

    it("Should accept valid values in `config.paths.sources`", async () => {
      assert.deepEqual(await validateSolidityUserConfig({}), []);

      assert.deepEqual(await validateSolidityUserConfig({ paths: {} }), []);

      assert.deepEqual(
        await validateSolidityUserConfig({ paths: { sources: "contracts" } }),
        [],
      );

      assert.deepEqual(
        await validateSolidityUserConfig({ paths: { sources: ["contracts"] } }),
        [],
      );

      assert.deepEqual(
        await validateSolidityUserConfig({ paths: { sources: {} } }),
        [],
      );

      assert.deepEqual(
        await validateSolidityUserConfig({
          paths: {
            sources: {
              solidity: "contracts",
            },
          },
        }),
        [],
      );

      assert.deepEqual(
        await validateSolidityUserConfig({
          paths: {
            sources: {
              solidity: ["contracts"],
            },
          },
        }),
        [],
      );
    });
  });
  it("should validate the user config", async () => {
    assert.deepEqual(await validateSolidityUserConfig({}), []);
  });
});

describe("solidity plugin config resolution", () => {
  it("should resolve the user config", async () => {});
});
