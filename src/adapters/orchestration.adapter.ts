export interface OrchestrationAdapter {

    /************ cloud functions instance *************/
    functionsInstanceDeploy(projectId: string, force: boolean): Promise<any>;

    functionsInstanceAddEnv(projectId: string, envs: string[], force: boolean): Promise<any>;

    functionsInstanceAddDomain(projectId: string, domain: string, force: boolean): Promise<any>;

    functionsInstanceRemoveDomain(projectId: string, force: boolean): Promise<any>;

    functionsInstanceSwitchOn(projectId: string, force: boolean): Promise<any>;

    functionsInstanceSwitchOff(projectId: string, force: boolean): Promise<any>;

    functionsInstanceRemoveEnv(projectId: string, envs: string[], force: boolean): Promise<any>;

    /************ database instance ***************/
    databaseInstanceImage(projectId: string, image: string, force: boolean): Promise<any>;

    databaseInstanceAddEnv(projectId: string, envs: string[], force: boolean): Promise<any>;

    databaseInstanceRemoveEnv(projectId: string, envs: string[], force: boolean): Promise<any>;

}
