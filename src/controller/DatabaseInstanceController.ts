import {BFastOptions} from "../config/BFastOptions";
import {SwarmOrchestrationFactory} from "../factory/SwarmOrchestrationFactory";
import {ContainerOrchestrationAdapter} from "../adapter/containerOrchestration";
import {Utils} from "./utils";

let containerOrch: ContainerOrchestrationAdapter;

export class DatabaseInstanceController {
    constructor(private  options: BFastOptions) {
        containerOrch = this.options.containerOrchAdapter ?
            this.options.containerOrchAdapter : new SwarmOrchestrationFactory(this.options);
    }

    async updateImage(projectId: string, image: string, force: boolean = false): Promise<any> {
        if (image && typeof image === "string" && image.toString().trim().startsWith('joshuamshana/bfast-ce-daas') === true) {
            return await containerOrch.updateDatabaseInstanceImage(
                Utils._checkProjectId(projectId),
                image,
                force
            );
        } else {
            throw {message: "Bad image name format"};
        }
    }

}
