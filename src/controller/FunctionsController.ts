import {ContainerOrchestrationAdapter} from "../adapter/containerOrchestration";
import {Options} from "../config/Options";
import {SwarmOrchestrationFactory} from "../factory/SwarmOrchestrationFactory";
import {Utils} from "./utils";

let containerOrch: ContainerOrchestrationAdapter;

/**
 * @class FunctionsController. Manage BFast::Function instance include
 * deploy and add or remove environment variable(s)
 */
export class FunctionsController {

    constructor(private  options: Options) {
        containerOrch = this.options.containerOrchAdapter ?
            this.options.containerOrchAdapter : new SwarmOrchestrationFactory(this.options);
    }

    async deploy(projectId: string = '', force: boolean = false): Promise<any> {
        try {
            return await containerOrch.cloudFunctionsDeploy(
                Utils._checkProjectId(projectId), force);
        } catch (e) {
            throw e.toString();
        }
    }

    async envAdd(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        try {
            return await containerOrch.cloudFunctionsAddEnv(
                Utils._checkProjectId(projectId), envs, force);
        } catch (e) {
            throw e.toString();
        }
    }

    async envRemove(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        try {
            return await containerOrch.cloudFunctionsRemoveEnv(
                Utils._checkProjectId(projectId), envs, force);
        } catch (e) {
            throw e;
        }
    }

    async addDomain(projectId: string, domain: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.cloudFunctionAddDomain(
                Utils._checkProjectId(projectId), domain, force);
        } catch (e) {
            throw e;
        }
    }

    async removeDomain(projectId: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.cloudFunctionRemoveDomain(
                Utils._checkProjectId(projectId), force);
        } catch (e) {
            throw e;
        }
    }

    async faasOn(projectId: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.cloudFunctionSwitchOn(
                Utils._checkProjectId(projectId), force
            );
        } catch (e) {
            throw e;
        }
    }

    async faasOff(projectId: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.cloudFunctionSwitchOff(
                Utils._checkProjectId(projectId), force
            );
        } catch (e) {
            throw e;
        }
    }

}
