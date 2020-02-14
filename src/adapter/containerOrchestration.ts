export interface ContainerOrchestrationAdapter {

    // cloud functions
    cloudFunctionsDeploy(projectId: string, force: boolean): Promise<any>;

    cloudFunctionsAddEnv(projectId: string, envs: string[], force: boolean): Promise<any>;

    cloudFunctionAddDomain(projectId: string, domain: string, force: boolean): Promise<any>;

    cloudFunctionRemoveDomain(projectId: string, force: boolean): Promise<any>;

    cloudFunctionSwitchOn(projectId: string, force: boolean): Promise<any>;

    cloudFunctionSwitchOff(projectId: string, force: boolean): Promise<any>;

    cloudFunctionsRemoveEnv(projectId: string, envs: string[], force: boolean): Promise<any>;

    // dashboard
    cloudDashboardSwitchOn(projectId: string, force: boolean): Promise<any>;

    cloudDashboardSwitchOff(projectId: string, force: boolean): Promise<any>;

    // database
    liveQueryClasses(projectId: string, classes: string[], force: boolean): Promise<any>;

}
