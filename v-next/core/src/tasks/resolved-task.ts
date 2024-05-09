import {
  TaskAction,
  TaskFlag,
  TaskValueParameter,
  TaskVariadicValueParameter,
} from "./types.js";

export enum ResolvedTaskType {
  HELP_ACTION = "HELP_ACTION",
  CUSTOM_ACTION = "NORMAL_TASK",
}

export interface HelpResolvedTask {
  type: ResolvedTaskType.HELP_ACTION;
  id: string[];
  description: string;
}

export interface CustomActionResolvedTask {
  type: ResolvedTaskType.CUSTOM_ACTION;

  id: string[];

  description: string;

  actions: TaskAction[];

  namedParameters: Record<string, TaskValueParameter>;

  flags: Record<string, TaskFlag>;

  positionalParameters: TaskValueParameter[];

  variadicParameter?: TaskVariadicValueParameter;

  collectUnrecognizedArguments: boolean;
}

export type ResolvedTask = HelpResolvedTask | CustomActionResolvedTask;
