import {DockerI} from "../adapters/dockerI";

/**
 * @class FunctionsController. Manage BFast::Function instance include
 * deploy and add or remove environment variable(s)
 */
export class FunctionsController {
    /**
     *
     * @param docker {DockerI} implementation of DockerI interface for
     * communicate with outside docker system
     */
    constructor(private readonly docker: DockerI) {
    }

    private static _checkProjectId(projectId: string): string {
        if (projectId.length < 1) {
            throw 'projectId required and can not be empty';
        } else {
            return projectId;
        }
    }

    async deploy(projectId: string = '', force: boolean = false): Promise<any> {
        try {
            return await this.docker.deployFaaSEngine(FunctionsController._checkProjectId(projectId), force);
        } catch (e) {
            throw e.toString();
        }
    }

    async envAdd(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        try {
            return await this.docker.envAddToFaaSEngine(FunctionsController._checkProjectId(projectId), envs, force)
        } catch (e) {
            throw e.toString();
        }
    }

    async envRemove(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        try {
            return await this.docker.envRemoveFromFaaSEngine(FunctionsController._checkProjectId(projectId), envs, force)
        } catch (e) {
            throw e.toString();
        }
    }
}
