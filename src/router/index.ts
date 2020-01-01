import {RestRouterAdapter} from "../adapter/rest";
import {Options} from "../config/Options";
import {FunctionsRouter} from "./FunctionsRouter";
import {LandingRouter} from "./LandingRouter";
import {ProjectRouter} from "./ProjectRouter";
import {UsersRouter} from "./UsersRouter";

export class BFastRouters {
    constructor(private options: Options) {
    }

    getApiRoutes(): RestRouterAdapter[] {
        return [
            new FunctionsRouter(this.options),
            new LandingRouter(),
            new ProjectRouter(this.options),
            new UsersRouter(this.options)
        ]
    }
}
