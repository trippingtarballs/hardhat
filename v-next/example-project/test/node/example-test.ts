import { HardhatPluginError } from "@ignored/hardhat-vnext-errors";
import { describe, it } from "node:test";

describe("Example test", () => {
  it("should not work", () => {
    throw new HardhatPluginError("HHE1", "Hello!");
  });
});
