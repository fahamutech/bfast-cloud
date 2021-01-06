import {OrchestrationAdapter} from "../adapters/orchestration.adapter.mjs";
import {UtilsController} from "./utils.controller.mjs";

/**
 * @class FunctionsInstanceController. Manage BFast::Function instance include
 * deploy and add or remove environment variable(s)
 */
export class FunctionsInstanceController {

    /**
     *
     * @param containerOrch {OrchestrationAdapter}
     */
    constructor(containerOrch) {
        this.containerOrch = containerOrch;
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async deploy(projectId = '', force = false) {
        return await this.containerOrch.functionsInstanceDeploy(UtilsController.checkProjectId(projectId), force);
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async envAdd(projectId, envs, force = false) {
        envs = envs.filter(x => x.trim() !== '');
        return await this.containerOrch
            .functionsInstanceAddEnv(UtilsController.checkProjectId(projectId), envs, force);
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async envRemove(projectId, envs, force = false) {
        envs = envs.filter(x => x.trim() !== '');
        return await this.containerOrch
            .functionsInstanceRemoveEnv(UtilsController.checkProjectId(projectId), envs, force);
    }

    /**
     *
     * @param projectId {string}
     * @param domain {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async addDomain(projectId, domain, force = false) {
        return await this.containerOrch
            .functionsInstanceAddDomain(UtilsController.checkProjectId(projectId), domain, force);
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async removeDomain(projectId, force = false) {
        return await this.containerOrch
            .functionsInstanceRemoveDomain(UtilsController.checkProjectId(projectId), force);
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async faasOn(projectId, force = false) {
        return await this.containerOrch.functionsInstanceSwitchOn(UtilsController.checkProjectId(projectId), force);
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async faasOff(projectId, force = false) {
        return await this.containerOrch.functionsInstanceSwitchOff(UtilsController.checkProjectId(projectId), force);
    }

}
