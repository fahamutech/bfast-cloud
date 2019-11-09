import {UserController} from "./controller/userController";
import {ProjectController} from "./controller/projectController";
import {DatabaseController} from "./controller/databaseController";
import {DeployController} from "./controller/deployController";

export class BFastCli {
    static get user() {
        return new UserController()
    }

    static get projects() {
        return new ProjectController(this.database)
    }

    static get database() {
        return new DatabaseController()
    }

    static get deploy() {
        return new DeployController()
    }
}
