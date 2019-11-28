import {UserController} from "./userController";
import {ProjectController} from "./projectController";
import {FunctionsController} from "./functionsController";
import {ProjectDatabaseFactory} from "../factory/projectDatabaseFactory";
import {NodeShellFactory} from "../factory/nodeShellFactory";
import {DockerCmdFactory} from "../factory/dockerCmdFactory";

export const BFastControllers = {
    user: () => {
        return new UserController()
    },

    projects: () => {
        return new ProjectController(new ProjectDatabaseFactory(), new NodeShellFactory())
    },

    functions: () => {
        return new FunctionsController(new DockerCmdFactory());
    }
};
