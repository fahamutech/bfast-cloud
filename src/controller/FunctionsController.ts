import {ContainerOrchestrationAdapter} from "../adapter/containerOrchestration";
import {Options} from "../config/Options";
import {SwarmOrchestrationFactory} from "../factory/SwarmOrchestrationFactory";

/**
 * @class FunctionsController. Manage BFast::Function instance include
 * deploy and add or remove environment variable(s)
 */
export class FunctionsController {
    private readonly containerOrch: ContainerOrchestrationAdapter;

    constructor(private readonly options: Options) {
        this.containerOrch = this.options.containerOrchAdapter ?
            this.options.containerOrchAdapter : new SwarmOrchestrationFactory(this.options);
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
            return await this.containerOrch.cloudFunctionsDeploy(
                FunctionsController._checkProjectId(projectId), force);
        } catch (e) {
            throw e.toString();
        }
    }

    async envAdd(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        try {
            return await this.containerOrch.cloudFunctionsAddEnv(
                FunctionsController._checkProjectId(projectId), envs, force)
        } catch (e) {
            throw e.toString();
        }
    }

    async envRemove(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        try {
            return await this.containerOrch.cloudFunctionsRemoveEnv(
                FunctionsController._checkProjectId(projectId), envs, force)
        } catch (e) {
            throw e.toString();
        }
    }
}
