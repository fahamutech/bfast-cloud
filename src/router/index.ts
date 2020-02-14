import {RestRouterAdapter} from "../adapter/rest";
import {Options} from "../config/Options";
import {FunctionsRouter} from "./FunctionsRouter";
import {LandingRouter} from "./LandingRouter";
import {ProjectRouter} from "./ProjectRouter";
import {UsersRouter} from "./UsersRouter";
import {DashboardRouter} from "./DashboardRouter";
import {DaasRouter} from "./DaasRouter";

export class BFastRouters {
    constructor(private options: Options) {
    }

    getApiRoutes(): RestRouterAdapter[] {
        return [
            new FunctionsRouter(this.options),
            new LandingRouter(this.options),
            new ProjectRouter(this.options),
            new UsersRouter(this.options),
            new DashboardRouter(this.options),
            new DaasRouter(this.options),
        ]
    }
}
