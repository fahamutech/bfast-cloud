export interface DockerAdapter {
    deployFaaSEngine(projectId: string, force: boolean): Promise<any>;

    envAddToFaaSEngine(projectId: string, envs: string[], force: boolean): Promise<any>;

    envRemoveFromFaaSEngine(projectId: string, envs: string[], force: boolean): Promise<any>;
}
