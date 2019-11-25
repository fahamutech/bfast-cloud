import {UserController} from "./controller/userController";
import {ProjectController} from "./controller/projectController";
import {DatabaseController} from "./controller/databaseController";
import {DeployController} from "./controller/deployController";
import {FunctionsController} from "./controller/functionsController";
import {DockerController} from "./controller/dockerController";

export class BFastCli {
    static get user() {
        return new UserController()
    }

    static get projects() {
        return new ProjectController(new DatabaseController())
    }

    static get database() {
        return new DatabaseController()
    }

    /**
     * @deprecated Since v0.2.0 and will be removed in v1.0.0 use BFastCli.functions#deploy instead
     */
    static get deploy() {
        return new DeployController()
    }

    static get functions() {
        return new FunctionsController(new DockerController());
    }
}
