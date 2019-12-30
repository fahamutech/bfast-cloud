import {UserController} from "./userController";
import {ProjectController} from "./projectController";
import {FunctionsController} from "./functionsController";
import {NodeShellFactory} from "../factory/NodeShellFactory";
import {SwarmOrchestration} from "../factory/swarmOrchestration";
import {BFastSecurity} from "../factory/SecurityFactory";
import {EmailFactory} from "../factory/EmailFactory";
import {Options} from "../config/Options";

const options = new Options(
    process.env.mdbhost || 'mdb',
    process.env.debug || 'false',
    process.env.dSocket || '/usr/local/bin/docker',
    ''
);

export const BFastControllers = {
    user: () => {
        return new UserController(options, new BFastSecurity(options), new EmailFactory());
    },

    projects: () => {
        return new ProjectController(options, new NodeShellFactory());
    },

    functions: () => {
        return new FunctionsController(new SwarmOrchestration(options, new NodeShellFactory()));
    }
};
