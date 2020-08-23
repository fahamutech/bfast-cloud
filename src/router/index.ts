import {RestRouterAdapter} from "../adapter/rest";
import {BFastOptions} from "../config/BFastOptions";
import {FunctionsInstanceRouter} from "./FunctionsInstanceRouter";
import {LandingRouter} from "./LandingRouter";
import {ProjectRouter} from "./ProjectRouter";
import {UsersRouter} from "./UsersRouter";
import {DatabaseInstanceRouter} from "./DatabaseInstanceRouter";

export class BFastRouters {
    constructor(private options: BFastOptions) {
    }

    getApiRoutes(): RestRouterAdapter[] {
        return [
            new FunctionsInstanceRouter(this.options),
            new LandingRouter(this.options),
            new ProjectRouter(this.options),
            new UsersRouter(this.options),
            new DatabaseInstanceRouter(this.options),
        ]
    }
}
