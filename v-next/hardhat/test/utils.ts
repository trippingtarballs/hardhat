import type { ResolvedConfigurationVariable } from "../src/types/config.js";
import type { Interceptable } from "@ignored/hardhat-vnext-utils/request";

import { after, afterEach, before } from "node:test";

import { getTestDispatcher } from "@ignored/hardhat-vnext-utils/request";

export function createTestEnvManager() {
  const changes = new Set<string>();
  const originalValues = new Map<string, string | undefined>();

  afterEach(() => {
    // Revert changes to process.env based on the originalValues Map entries
    changes.forEach((key) => {
      const originalValue = originalValues.get(key);
      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    });
    changes.clear();
  });

  return {
    setEnvVar(name: string, value: string): void {
      // Before setting a new value, save the original value if it hasn't been saved yet
      if (!changes.has(name)) {
        originalValues.set(name, process.env[name]);
        changes.add(name);
      }
      process.env[name] = value;
    },
  };
}

interface InitializeOptions {
  url?: string;
  timeout?: number;
}

export const initializeTestDispatcher = async (
  options: InitializeOptions = {},
): Promise<Interceptable> => {
  const { url = "http://localhost", timeout } = options;

  const mockAgent = await getTestDispatcher({ timeout });
  const interceptor = mockAgent.get(url);

  before(() => {
    mockAgent.disableNetConnect();
  });

  after(() => {
    mockAgent.enableNetConnect();
    mockAgent.close();
  });

  return interceptor;
};

/**
 * This class is a mock implementation of `ResolvedConfigurationVariable`.
 * It doesn't actually resolve the variable, it just returns the value it was
 * constructed with.
 */
export class MockResolvedConfigurationVariable
  implements ResolvedConfigurationVariable
{
  public _type: "ResolvedConfigurationVariable" =
    "ResolvedConfigurationVariable";
  readonly #variable: unknown;

  constructor(variable: unknown) {
    this.#variable = variable;
  }

  public async get(): Promise<string> {
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    -- We assume that the variable is a string */
    return this.#variable as string;
  }

  public async getUrl(): Promise<string> {
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    -- We assume that the variable is a valid url */
    return this.#variable as string;
  }

  public async getBigInt(): Promise<bigint> {
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    -- We assume that the variable is a valid bigint */
    return this.#variable as bigint;
  }

  public async getHex(): Promise<`0x${string}`> {
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    -- We assume that the variable is a valid hex string */
    return this.#variable as `0x${string}`;
  }
}
