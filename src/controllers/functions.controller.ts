import {BfastConfig} from "../configs/bfast.config";
import {OrchestrationAdapter} from "../adapters/orchestration.adapter";
import {UtilsController} from "./utils.controller";
import {SwarmOrchestrationFactory} from "../factory/SwarmOrchestrationFactory";


let containerOrch: OrchestrationAdapter;

/**
 * @class FunctionsController. Manage BFast::Function instance include
 * deploy and add or remove environment variable(s)
 */
export class FunctionsController {

    constructor(private  options: BfastConfig) {
        containerOrch = this.options.containerOrchAdapter ?
            this.options.containerOrchAdapter : new SwarmOrchestrationFactory(this.options);
    }

    async deploy(projectId: string = '', force: boolean = false): Promise<any> {
        try {
            return await containerOrch.functionsInstanceDeploy(
                UtilsController._checkProjectId(projectId), force);
        } catch (e) {
            throw e.toString();
        }
    }

    async envAdd(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        try {
            return await containerOrch.functionsInstanceAddEnv(
                UtilsController._checkProjectId(projectId), envs, force);
        } catch (e) {
            throw e.toString();
        }
    }

    async envRemove(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        try {
            return await containerOrch.functionsInstanceRemoveEnv(
                UtilsController._checkProjectId(projectId), envs, force);
        } catch (e) {
            throw e;
        }
    }

    async addDomain(projectId: string, domain: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.functionsInstanceAddDomain(
                UtilsController._checkProjectId(projectId), domain, force);
        } catch (e) {
            throw e;
        }
    }

    async removeDomain(projectId: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.functionsInstanceRemoveDomain(
                UtilsController._checkProjectId(projectId), force);
        } catch (e) {
            throw e;
        }
    }

    async faasOn(projectId: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.functionsInstanceSwitchOn(
                UtilsController._checkProjectId(projectId), force
            );
        } catch (e) {
            throw e;
        }
    }

    async faasOff(projectId: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.functionsInstanceSwitchOff(
                UtilsController._checkProjectId(projectId), force
            );
        } catch (e) {
            throw e;
        }
    }

}
