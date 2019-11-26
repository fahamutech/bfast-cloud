import {UserController} from "./userController";
import {ProjectController} from "./projectController";
import {DeployController} from "./deployController";
import {FunctionsController} from "./functionsController";
import {DockerController} from "./dockerController";
import {MdbProjectDbFactory} from "../factory/mdbProjectDbFactory";
import {ChildProcessShellFactory} from "../factory/childProcessShellFactory";

export class BFastControllers {
    static get user() {
        return new UserController()
    }

    static get projects() {
        return new ProjectController(new MdbProjectDbFactory(), new ChildProcessShellFactory())
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
