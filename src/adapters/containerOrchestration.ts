export interface ContainerOrchestrationAdapter {
    cloudFunctionsDeploy(projectId: string, force: boolean): Promise<any>;

    cloudFunctionsAddEnv(projectId: string, envs: string[], force: boolean): Promise<any>;

    cloudFunctionsRemoveEnv(projectId: string, envs: string[], force: boolean): Promise<any>;
}
