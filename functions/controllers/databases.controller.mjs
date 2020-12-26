import {UtilsController} from "./utils.controller";

export class DatabasesController {
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
            return await this.containerOrch.databaseInstanceImage(
                UtilsController._checkProjectId(projectId),
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
     * @return {Promise<*>}
     */
    async envAdd(projectId, envs, force = false) {
        return await this.containerOrch.databaseInstanceAddEnv(UtilsController._checkProjectId(projectId), envs, force);
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async envRemove(projectId, envs, force = false) {
        return await this.containerOrch.databaseInstanceRemoveEnv(UtilsController._checkProjectId(projectId), envs, force);
    }

}
