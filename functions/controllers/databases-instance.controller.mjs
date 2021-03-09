import {UtilsController} from "./utils.controller.mjs";

export class DatabasesInstanceController {
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
     * @param image {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async updateImage(projectId, image, force = false) {
        if (image && typeof image === "string") {
            return this.containerOrch.databaseInstanceUpdateImage(
                UtilsController.checkProjectId(projectId),
                image,
                force
            );
        } else {
            throw {message: "Bad image name format"};
        }
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @param daemon
     * @return {Promise<*>}
     */
    async envAdd(projectId, envs, force = false, daemon = true) {
        envs = envs.filter(x => x.trim() !== '');
        return this.containerOrch.databaseInstanceAddEnv(UtilsController.checkProjectId(projectId), envs, force, daemon);
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @param daemon
     * @return {Promise<*>}
     */
    async envRemove(projectId, envs, force = false, daemon = true) {
        envs = envs.filter(x => x.trim() !== '');
        return this.containerOrch.databaseInstanceRemoveEnv(UtilsController.checkProjectId(projectId), envs, force, daemon);
    }

    /**
     *
     * @param id {string}
     * @return {Promise<*>}
     */
    async info(id) {
        return this.containerOrch.instanceInfo(UtilsController.checkProjectId(id));
    }

    /**
     *
     * @param id {string}
     * @return {Promise<*>}
     */
    async envs(id) {
        const info = await this.containerOrch.instanceInfo(UtilsController.checkProjectId(id));
        return info[0].Spec.TaskTemplate.ContainerSpec.Env;
    }

}
