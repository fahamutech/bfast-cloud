import {UserController} from "./userController";
import {ProjectController} from "./projectController";
import {FunctionsController} from "./functionsController";
import {NodeShellFactory} from "../factory/NodeShellFactory";
import {SwarmOrchestration} from "../factory/swarmOrchestration";
import {BFastSecurity} from "../factory/SecurityFactory";
import {EmailFactory} from "../factory/EmailFactory";

export const BFastControllers = {
    user: () => {
        return new UserController(new BFastSecurity(), new EmailFactory());
    },

    projects: () => {
        return new ProjectController(new NodeShellFactory());
    },

    functions: () => {
        return new FunctionsController(new SwarmOrchestration());
    }
};
