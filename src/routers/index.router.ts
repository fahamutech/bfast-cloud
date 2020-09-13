import {FunctionsRouter} from "./functions.router";
import {LandingRouter} from "./landing.router";
import {ProjectRouter} from "./project.router";
import {UserRouter} from "./user.router";
import {DatabaseRouter} from "./database.router";
import {BfastConfig} from "../configs/bfast.config";
import {RestRouterAdapter} from "../adapters/rest.adapter";

export class BFastRouters {
    constructor(private options: BfastConfig) {
    }

    getApiRoutes(): RestRouterAdapter[] {
        return [
            new FunctionsRouter(this.options),
            new LandingRouter(this.options),
            new ProjectRouter(this.options),
            new UserRouter(this.options),
            new DatabaseRouter(this.options),
        ]
    }
}
