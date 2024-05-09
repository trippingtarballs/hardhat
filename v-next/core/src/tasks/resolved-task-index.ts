import { GlobalParameterIndex } from "./global-params-index.js";
import { ResolvedTask } from "./resolved-task.js";
import { Config } from "./stubs.js";
import { TaskDefinition, TaskDefinitionType } from "./types.js";

export interface TaskIndexEntry {
  task?: ResolvedTask;
  pluginId?: string;
  subtasks: TaskIndex;
}

export interface TaskIndex {
  byIdFragment: Map<string, TaskIndexEntry>;
}

export function buildAndValidateTasksMap(
  config: Config,
  globalParameterIndex: GlobalParameterIndex,
): TaskIndex {
  const taskMap: TaskIndex = {
    byIdFragment: new Map(),
  };

  for (const plugin of config.plugins) {
    if (plugin.tasks === undefined) {
      continue;
    }

    for (const taskDefinition of plugin.tasks) {
      reduceTaskDefinition(
        taskMap,
        globalParameterIndex,
        taskDefinition,
        plugin.id,
      );
    }
  }

  for (const taskDefinition of config.tasks) {
    reduceTaskDefinition(taskMap, globalParameterIndex, taskDefinition);
  }

  return taskMap;
}

function reduceTaskDefinition(
  taskMap: TaskIndex,
  globalParameterIndex: GlobalParameterIndex,
  taskDefinition: TaskDefinition,
  pluginId?: string,
) {
  validateClashesWithGlobalParams(
    globalParameterIndex,
    taskDefinition,
    pluginId,
  );

  if (taskDefinition.type === TaskDefinitionType.NEW_TASK) {
    const resolvedTask: ResolvedTask = {
      id: taskDefinition.id,
      description: taskDefinition.description,
      actions: [taskDefinition.action],
      namedParameters: taskDefinition.namedParameters,
      flags: taskDefinition.flags,
      positionalParameters: taskDefinition.positionalParameters,
      variadicParameter: taskDefinition.variadicParameter,
    };

    insertTask(taskMap, taskDefinition.id, resolvedTask, pluginId);
  } else {
    const resolvedTask = getTask(taskMap, taskDefinition.id);
    if (resolvedTask === undefined) {
      if (pluginId !== undefined) {
        throw new Error(
          `Plugin ${pluginId} is trying to override the task "${taskDefinition.id.join(" ")}" but it hasn't been defined`,
        );
      } else {
        throw new Error(
          `Trying to override the task "${taskDefinition.id.join(" ")}" but it hasn't been defined`,
        );
      }
    }

    for (const paramName of Object.keys(taskDefinition.namedParameters)) {
      if (
        resolvedTask.namedParameters[paramName] !== undefined ||
        resolvedTask.flags[paramName] !== undefined
      ) {
        if (pluginId !== undefined) {
          throw new Error(
            `Plugin ${pluginId} is trying to override the named parameter ${paramName} of the task "${taskDefinition.id.join(" ")}" but it is already defined`,
          );
        } else {
          throw new Error(
            `Trying to override the named parameter ${paramName} of the task "${taskDefinition.id.join(" ")}" but it is already defined`,
          );
        }
      }
    }

    for (const [name, flag] of Object.entries(taskDefinition.flags)) {
      if (
        resolvedTask.flags[name] !== undefined ||
        resolvedTask.namedParameters[name] !== undefined
      ) {
        if (pluginId !== undefined) {
          throw new Error(
            `Plugin ${pluginId} is trying to override the flag ${name} of the task "${taskDefinition.id.join(" ")}" but it is already defined`,
          );
        } else {
          throw new Error(
            `Trying to override the flag ${name} of the task "${taskDefinition.id.join(" ")}" but it is already defined`,
          );
        }
      }
    }

    for (const namedParam of Object.values(taskDefinition.namedParameters)) {
      resolvedTask.namedParameters[namedParam.name] = namedParam;
    }

    for (const flag of Object.values(taskDefinition.flags)) {
      resolvedTask.flags[flag.name] = flag;
    }

    resolvedTask.actions = [taskDefinition.action, ...resolvedTask.actions];
  }
}

function validateClashesWithGlobalParams(
  globalParameterIndex: GlobalParameterIndex,
  taskDefinition: TaskDefinition,
  pluginId?: string,
) {
  for (const namedParamName of Object.keys(taskDefinition.namedParameters)) {
    const globalParamEntry = globalParameterIndex.byName.get(namedParamName);

    if (globalParamEntry !== undefined) {
      if (pluginId === undefined) {
        throw new Error(
          `Trying to define task "${taskDefinition.id.join(" ")}" with the named parameter ${namedParamName} but it is already defined as a global parameter by plugin ${globalParamEntry.pluginId}`,
        );
      } else {
        throw new Error(
          `Plugin ${pluginId} trying to define task "${taskDefinition.id.join(" ")}" with the named parameter ${namedParamName} but it is already defined as a global parameter by plugin ${globalParamEntry.pluginId}`,
        );
      }
    }
  }

  for (const [flagName, flag] of Object.entries(taskDefinition.flags)) {
    const globalParamEntryByName = globalParameterIndex.byName.get(flagName);

    if (globalParamEntryByName !== undefined) {
      if (pluginId === undefined) {
        throw new Error(
          `Trying to define task "${taskDefinition.id.join(" ")}" with the flag ${flagName} but it is already defined as a global parameter by plugin ${globalParamEntryByName.pluginId}`,
        );
      } else {
        throw new Error(
          `Plugin ${pluginId} trying to define task "${taskDefinition.id.join(" ")}" with the flag ${flagName} but it is already defined as a global parameter by plugin ${globalParamEntryByName.pluginId}`,
        );
      }
    }
  }
}

function getTask(
  taskMap: TaskIndex,
  taskId: string[],
): ResolvedTask | undefined {
  let map = taskMap;

  for (let i = 0; i < taskId.length; i++) {
    const idFragment = taskId[i];

    const entry = map.byIdFragment.get(idFragment);
    if (entry === undefined) {
      return undefined;
    }

    if (i === taskId.length - 1) {
      return entry.task;
    }

    map = entry.subtasks;
  }

  return undefined;
}

function insertTask(
  taskMap: TaskIndex,
  taskId: string[],
  task: ResolvedTask,
  pluginId?: string,
) {
  let map = taskMap;

  for (let i = 0; i < taskId.length; i++) {
    const idFragment = taskId[i];

    let entry = map.byIdFragment.get(idFragment);
    if (entry === undefined) {
      entry = { task: undefined, subtasks: { byIdFragment: new Map() } };
      map.byIdFragment.set(idFragment, entry);
    }

    if (i === taskId.length - 1) {
      if (entry.task !== undefined) {
        const definedByMessage =
          entry.pluginId !== undefined ? ` by plugin ${entry.pluginId}` : "";

        if (pluginId !== undefined) {
          throw new Error(
            `Plugin ${pluginId} is trying to define the task "${taskId.join(" ")}" but it is already defined${definedByMessage}`,
          );
        }

        throw new Error(
          `You are trying to defined the task "${taskId.join(" ")}" is already defined${definedByMessage}`,
        );
      }

      entry.task = task;
      entry.pluginId = pluginId;
    }

    map = entry.subtasks;
  }
}
