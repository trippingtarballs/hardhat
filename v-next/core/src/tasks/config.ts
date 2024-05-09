import {
  TaskDefinitionBuilderImplementation,
  TaskOverrideBuilderImplementation,
} from "./builders.js";
import {
  ArgumentType,
  GlobalFlag,
  GlobalNamedValueParameter,
  GlobalParameterType,
  TaskDefinitionBuilder,
  TaskOverrideBuilder,
} from "./types.js";

export function task(
  name: string | string[],
  description: string = "",
): TaskDefinitionBuilder {
  return new TaskDefinitionBuilderImplementation(name, description);
}

export function helpTask(
  name: string | string[],
  description: string,
): TaskDefinitionBuilder {
  return new TaskDefinitionBuilderImplementation(
    name,
    description,
  ).useAsHelpTask();
}

export function overrideTask(name: string | string[]): TaskOverrideBuilder {
  return new TaskOverrideBuilderImplementation(name);
}

export function globalNamedParameter(options: {
  name: string;
  description: string;
  argumentType: ArgumentType;
  defaultValue: any;
}): GlobalNamedValueParameter {
  // TODO: Validate name casing
  // TODO: Validate default value matches with type
  // TODO: Validate that the name is not `config`, `help` nor `showStackTraces`

  return {
    type: GlobalParameterType.NAMED_VALUE_TYPE,
    name: options.name,
    description: options.description,
    argumentType: options.argumentType,
    defaultValue: options.defaultValue,
  };
}

export function globalFlag(options: {
  name: string;
  description: string;
  char?: string;
}): GlobalFlag {
  // TODO: Validate name casing
  // TODO: Validate that the name is not `config`, `help` nor `showStackTraces`
  // TODO: Validate that char is actually a char

  return {
    type: GlobalParameterType.FLAG_TYPE,
    name: options.name,
    description: options.description,
    char: options.char,
  };
}
