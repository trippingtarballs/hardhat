export interface Config {
  plugins: Array<{
    id: string;
    tasks?: TaskDefinition[];
    globalParameters: Record<string, GlobalParameter>;
  }>;
  tasks: TaskDefinition[];
}
