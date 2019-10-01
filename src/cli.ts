import {UserController} from "./controller/userController";
import {ProjectController} from "./controller/projectController";
import {DatabaseController} from "./controller/databaseController";

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
}
