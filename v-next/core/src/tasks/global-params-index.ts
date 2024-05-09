import { Config } from "./stubs.js";
import { GlobalParameter, GlobalParameterType } from "./types.js";

export interface GlobalParameterIndexEntry {
  pluginId: string;
  param: GlobalParameter;
}

export interface GlobalParameterIndex {
  byName: Map<string, GlobalParameterIndexEntry>;
}

export function buildGlobalParametersIndex(
  config: Config,
): GlobalParameterIndex {
  const index: GlobalParameterIndex = {
    byName: new Map(),
  };

  for (const plugin of config.plugins) {
    for (const [name, param] of Object.entries(plugin.globalParameters)) {
      const existingByName = index.byName.get(name);

      if (existingByName !== undefined) {
        throw new Error(
          `Plugin ${plugin.id} is trying to define the global parameter ${name} but it is already defined by plugin ${existingByName.pluginId}`,
        );
      }

      const indexEntry = {
        pluginId: plugin.id,
        param,
      };

      index.byName.set(param.name, indexEntry);
    }
  }

  return index;
}
