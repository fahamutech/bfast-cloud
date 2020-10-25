import {UtilsController} from "./utils.controller";
import {BfastConfig} from "../configs/bfast.config";
import {OrchestrationAdapter} from "../adapters/orchestration.adapter";
import {SwarmOrchestrationFactory} from "../factory/SwarmOrchestrationFactory";

let containerOrch: OrchestrationAdapter;

export class DatabaseController {
    constructor(private  options: BfastConfig) {
        containerOrch = this.options.containerOrchAdapter ?
            this.options.containerOrchAdapter : new SwarmOrchestrationFactory(this.options);
    }

    async updateImage(projectId: string, image: string, force: boolean = false): Promise<any> {
        if (image && typeof image === "string") {
            return await containerOrch.databaseInstanceImage(
                UtilsController._checkProjectId(projectId),
                image,
                force
            );
        } else {
            throw {message: "Bad image name format"};
        }
    }

    async envAdd(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        return await containerOrch.databaseInstanceAddEnv(
            UtilsController._checkProjectId(projectId), envs, force);
    }

    async envRemove(projectId: string, envs: string[], force: boolean = false): Promise<any> {
        return await containerOrch.databaseInstanceRemoveEnv(
            UtilsController._checkProjectId(projectId), envs, force);
    }

}
