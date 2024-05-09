export enum ArgumentType {
  STRING = "STRING",
  BOOLEAN = "BOOLEAN",
  INT = "INT",
  BIGINT = "BIGINT",
  FLOAT = "FLOAT",
  FILE = "FILE",
}

export enum GlobalParameterType {
  FLAG_TYPE = "FLAG_TYPE",
  NAMED_VALUE_TYPE = "NAMED_VALUE_TYPE",
}

export interface GlobalFlag {
  type: GlobalParameterType.FLAG_TYPE;
  name: string;
  description: string;
}

export interface GlobalNamedValueParameter {
  type: GlobalParameterType.NAMED_VALUE_TYPE;
  name: string;
  description: string;
  argumentType: ArgumentType;
  defaultValue: any;
}

export type GlobalParameter = GlobalFlag | GlobalNamedValueParameter;

export interface TaskValueParameter {
  name: string;
  description: string;
  argumentType: ArgumentType;
  defaultValue?: any;
}

export interface TaskFlag {
  name: string;
  description: string;
}

export interface TaskVariadicValueParameter {
  name: string;
  description: string;
  argumentType: ArgumentType;
  defaultValue?: any[];
}

export enum TaskActionType {
  INLINE_ACTION = "INLINE_ACTION",
  FILE_URL_ACTION = "FILE_URL_ACTION",
  SUBTASKS_HELP_ACTION = "SUBTASKS_HELP_ACTION",
}

export interface InlineAction {
  type: TaskActionType.INLINE_ACTION;
  action: (...args: any[]) => any;
}

export interface FileUrlAction {
  type: TaskActionType.FILE_URL_ACTION;
  url: string;
}

export interface SubtasksHelpAction {
  type: TaskActionType.SUBTASKS_HELP_ACTION;
}

export type TaskAction = InlineAction | FileUrlAction | SubtasksHelpAction;

export enum TaskDefinitionType {
  NEW_TASK = "NEW_TASK",
  TASK_OVERRIDE = "TASK_OVERRIDE",
}

export interface NewTaskDefintion {
  type: TaskDefinitionType.NEW_TASK;

  id: string[];

  description: string;

  action: TaskAction;

  namedParameters: Record<string, TaskValueParameter>;

  flags: Record<string, TaskFlag>;

  positionalParameters: TaskValueParameter[];

  variadicParameter?: TaskVariadicValueParameter;
}

export interface TaskOverrideDefinition {
  type: TaskDefinitionType.TASK_OVERRIDE;

  id: string[];

  description?: string;

  action: TaskAction;

  namedParameters: Record<string, TaskValueParameter>;

  flags: Record<string, TaskFlag>;
}

export type TaskDefinition = NewTaskDefintion | TaskOverrideDefinition;

export interface TaskDefinitionBuilder {
  setDescription(description: string): this;

  setAction(action: ((...args: any[]) => any) | string): this;

  useAsHelpTask(): this;

  addParam(paramOptions: {
    name: string;
    description?: string;
    type?: ArgumentType;
    defaultValue?: any;
  }): this;

  addFlag(flagOptions: { name: string; description?: string }): this;

  addPositionalParam(paramOptions: {
    name: string;
    description?: string;
    type?: ArgumentType;
    defaultValue?: any;
  }): this;

  addVariadicParam(paramOptions: {
    name: string;
    description?: string;
    type?: ArgumentType;
    defaultValue?: any[];
  }): this;

  build(): NewTaskDefintion;
}

export interface TaskOverrideBuilder {
  setDescription(description: string): this;

  addParam(paramOptions: {
    name: string;
    description?: string;
    type?: ArgumentType;
    defaultValue: any;
  }): this;

  addFlag(flagOptions: { name: string; description?: string }): this;

  setAction(action: ((...args: any[]) => any) | string): this;

  build(): TaskOverrideDefinition;
}
