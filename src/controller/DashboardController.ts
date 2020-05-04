import {Utils} from "./utils";
import {BFastOptions} from "../config/BFastOptions";
import {SwarmOrchestrationFactory} from "../factory/SwarmOrchestrationFactory";
import {ContainerOrchestrationAdapter} from "../adapter/containerOrchestration";

let containerOrch: ContainerOrchestrationAdapter;

export class DashboardController {
    constructor(private  options: BFastOptions) {
        containerOrch = this.options.containerOrchAdapter ?
            this.options.containerOrchAdapter : new SwarmOrchestrationFactory(this.options);
    }

    async dashboardOff(projectId: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.cloudDashboardSwitchOff(
                Utils._checkProjectId(projectId), force
            );
        } catch (e) {
            throw e;
        }
    }

    async dashboardOn(projectId: string, force: boolean = false): Promise<any> {
        try {
            return await containerOrch.cloudDashboardSwitchOn(
                Utils._checkProjectId(projectId), force
            );
        } catch (e) {
            throw e;
        }
    }
}
