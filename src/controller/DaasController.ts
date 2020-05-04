import {BFastOptions} from "../config/BFastOptions";
import {SwarmOrchestrationFactory} from "../factory/SwarmOrchestrationFactory";
import {ContainerOrchestrationAdapter} from "../adapter/containerOrchestration";
import {Utils} from "./utils";

let containerOrch: ContainerOrchestrationAdapter;

export class DaasController {
    constructor(private  options: BFastOptions) {
        containerOrch = this.options.containerOrchAdapter ?
            this.options.containerOrchAdapter : new SwarmOrchestrationFactory(this.options);
    }

    async classLiveQuery(projectId: string, classes: string[], force: boolean = false): Promise<any> {
        try {
            if (classes && !Array.isArray(classes)) {
                throw {message: "classes is empty"};
            }
            return await containerOrch.liveQueryClasses(
                Utils._checkProjectId(projectId), classes, force
            );
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

}
