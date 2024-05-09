import {
  ArgumentType,
  NewTaskDefintion,
  TaskAction,
  TaskActionType,
  TaskDefinitionBuilder,
  TaskDefinitionType,
  TaskFlag,
  TaskOverrideBuilder,
  TaskOverrideDefinition,
  TaskValueParameter,
  TaskVariadicValueParameter,
} from "./types.js";

const VALID_PARAM_NAME_CASING_REGEX = /^[a-z]+(?:[a-zA-Z0-9])*$/;

function isValidParamNameCasing(name: string): boolean {
  return name.match(VALID_PARAM_NAME_CASING_REGEX) !== null;
}

// TODO: Argument names shouldn't be config, showStackTraces nor help

export class TaskDefinitionBuilderImplementation
  implements TaskDefinitionBuilder
{
  readonly #name: string[];

  readonly #usedNames: Set<string> = new Set();

  readonly #namedParams: Record<string, TaskValueParameter> = {};
  readonly #flags: Record<string, TaskFlag> = {};
  readonly #positionalParams: TaskValueParameter[] = [];

  #description: string;
  #variadicParam?: TaskVariadicValueParameter;
  #action?: TaskAction;

  constructor(name: string | string[], description: string = "") {
    this.#name = Array.isArray(name) ? name : [name];
    this.#description = description;
  }

  public setDescription(description: string): this {
    this.#description = description;
    return this;
  }

  public setAction(action: ((...args: any[]) => any) | string): this {
    if (typeof action === "string") {
      if (!action.startsWith("file://") || action === "file://") {
        throw new Error("Invalid action file URL");
      }

      this.#action = {
        type: TaskActionType.FILE_URL_ACTION,
        url: action,
      };
    } else {
      this.#action = {
        type: TaskActionType.INLINE_ACTION,
        action,
      };
    }

    return this;
  }

  public addParam({
    name,
    description = "",
    type = ArgumentType.STRING,
    defaultValue,
  }: {
    name: string;
    description?: string;
    type?: ArgumentType;
    defaultValue?: any;
  }): this {
    if (!isValidParamNameCasing(name)) {
      throw new Error("Invalid param name");
    }

    if (this.#usedNames.has(name)) {
      throw new Error(`Parameter ${name} already exists`);
    }

    this.#usedNames.add(name);

    // TODO: Validate that default value matches with type

    this.#namedParams[name] = {
      name,
      description,
      argumentType: type,
      defaultValue,
    };

    return this;
  }

  public addFlag({
    name,
    description = "",
  }: {
    name: string;
    description?: string;
  }): this {
    if (!isValidParamNameCasing(name)) {
      throw new Error("Invalid param name");
    }

    if (this.#usedNames.has(name)) {
      throw new Error(`Parameter ${name} already exists`);
    }

    this.#usedNames.add(name);

    this.#flags[name] = {
      name,
      description,
    };

    return this;
  }

  public addPositionalParam({
    name,
    description = "",
    type = ArgumentType.STRING,
    defaultValue,
  }: {
    name: string;
    description?: string;
    type?: ArgumentType;
    defaultValue?: any;
  }): this {
    if (!isValidParamNameCasing(name)) {
      throw new Error("Invalid param name");
    }

    if (this.#usedNames.has(name)) {
      throw new Error(`Parameter ${name} already exists`);
    }

    this.#usedNames.add(name);

    if (this.#variadicParam !== undefined) {
      throw new Error("Cannot add positional param after variadic param");
    }

    if (this.#positionalParams.length > 0) {
      const lastParam =
        this.#positionalParams[this.#positionalParams.length - 1];

      if (lastParam.defaultValue !== undefined && defaultValue === undefined) {
        throw new Error(
          "Cannot add required positional param after an optional one",
        );
      }
    }

    // TODO: Valdate default value matches with type

    this.#positionalParams.push({
      name,
      description,
      argumentType: type,
      defaultValue,
    });

    return this;
  }

  public addVariadicParam({
    name,
    description = "",
    type = ArgumentType.STRING,
    defaultValue,
  }: {
    name: string;
    description?: string;
    type?: ArgumentType;
    defaultValue?: any[];
  }): this {
    if (!isValidParamNameCasing(name)) {
      throw new Error("Invalid param name");
    }

    if (this.#usedNames.has(name)) {
      throw new Error(`Parameter ${name} already exists`);
    }

    this.#usedNames.add(name);

    if (this.#variadicParam !== undefined) {
      throw new Error("Cannot add variadic param after variadic param");
    }

    if (this.#positionalParams.length > 0) {
      const lastParam =
        this.#positionalParams[this.#positionalParams.length - 1];

      if (lastParam.defaultValue !== undefined && defaultValue === undefined) {
        throw new Error(
          "Cannot add required variadic param after an optional one",
        );
      }
    }

    // TODO: Valdate default value matches with type

    this.#variadicParam = {
      name,
      description,
      argumentType: type,
      defaultValue,
    };

    return this;
  }

  public useAsHelpTask(): this {
    this.#action = {
      type: TaskActionType.SUBTASKS_HELP_ACTION,
    };

    return this;
  }

  public build(): NewTaskDefintion {
    if (this.#action === undefined) {
      throw new Error("Missing action");
    }

    return {
      type: TaskDefinitionType.NEW_TASK,
      id: this.#name,
      description: this.#description,
      action: this.#action,
      namedParameters: this.#namedParams,
      flags: this.#flags,
      positionalParameters: this.#positionalParams,
    };
  }
}

export class TaskOverrideBuilderImplementation implements TaskOverrideBuilder {
  readonly #name: string[];

  readonly #usedNames: Set<string> = new Set();

  readonly #namedParams: Record<string, TaskValueParameter> = {};
  readonly #flags: Record<string, TaskFlag> = {};
  #action?: TaskAction;
  #description?: string;

  constructor(name: string | string[]) {
    this.#name = Array.isArray(name) ? name : [name];
  }

  public setDescription(description: string): this {
    this.#description = description;
    return this;
  }

  public addParam({
    name,
    description = "",
    type = ArgumentType.STRING,
    defaultValue,
  }: {
    name: string;
    description?: string;
    type?: ArgumentType;
    defaultValue: any;
  }): this {
    if (!isValidParamNameCasing(name)) {
      throw new Error("Invalid param name");
    }

    if (this.#usedNames.has(name)) {
      throw new Error(`Parameter ${name} already exists`);
    }

    this.#usedNames.add(name);

    // TODO: Validate that default value matches with type

    this.#namedParams[name] = {
      name,
      description,
      argumentType: type,
      defaultValue,
    };

    return this;
  }

  public addFlag({
    name,
    description = "",
  }: {
    name: string;
    description?: string;
  }): this {
    if (!isValidParamNameCasing(name)) {
      throw new Error("Invalid param name");
    }

    if (this.#usedNames.has(name)) {
      throw new Error(`Parameter ${name} already exists`);
    }

    this.#usedNames.add(name);

    this.#flags[name] = {
      name,
      description,
    };

    return this;
  }

  public setAction(action: ((...args: any[]) => any) | string): this {
    if (typeof action === "string") {
      if (!action.startsWith("file://") || action === "file://") {
        throw new Error("Invalid action file URL");
      }

      this.#action = {
        type: TaskActionType.FILE_URL_ACTION,
        url: action,
      };
    } else {
      this.#action = {
        type: TaskActionType.INLINE_ACTION,
        action,
      };
    }

    return this;
  }

  public build(): TaskOverrideDefinition {
    if (this.#action === undefined) {
      throw new Error("Missing action");
    }

    return {
      type: TaskDefinitionType.TASK_OVERRIDE,
      id: this.#name,
      description: this.#description,
      action: this.#action,
      namedParameters: this.#namedParams,
      flags: this.#flags,
    };
  }
}
