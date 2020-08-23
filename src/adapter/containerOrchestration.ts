export interface ContainerOrchestrationAdapter {

    /************ cloud functions instance *************/
    cloudFunctionsDeploy(projectId: string, force: boolean): Promise<any>;

    cloudFunctionsAddEnv(projectId: string, envs: string[], force: boolean): Promise<any>;

    cloudFunctionAddDomain(projectId: string, domain: string, force: boolean): Promise<any>;

    cloudFunctionRemoveDomain(projectId: string, force: boolean): Promise<any>;

    cloudFunctionSwitchOn(projectId: string, force: boolean): Promise<any>;

    cloudFunctionSwitchOff(projectId: string, force: boolean): Promise<any>;

    cloudFunctionsRemoveEnv(projectId: string, envs: string[], force: boolean): Promise<any>;

    /************ database instance ***************/
    updateDatabaseInstanceImage(projectId: string, image: string, force: boolean): Promise<any>;

}
