import {FunctionsRouter} from "./functions";
import {LandingRouter} from "./landing";
import {ProjectRouter} from "./project";
import {UsersRouter} from "./users";

export const BFastRouters = [
    new FunctionsRouter(),
    new LandingRouter(),
    new ProjectRouter(),
    new UsersRouter(), /* need to be checked */
];
