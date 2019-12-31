import {RestRouterModel} from "../adapters/rest";
import {Options} from "../config/Options";
import {ProjectStoreAdapter, UsersStoreAdapter} from "../adapters/database";

export class BFastRouters {
    constructor(private readonly options: Options,
                private readonly userDatabase: UsersStoreAdapter,
                private readonly projectDatabase: ProjectStoreAdapter,
    ) {
    }

    getRoutes(): RestRouterModel[] {
        return [
            // new FunctionsRouter(this.options, this.userDatabase, this.projectDatabase),
            // new LandingRouter(),
            // new ProjectRouter(this.options, this.userDatabase, this.projectDatabase),
            // new UsersRouter(this.options, this.userDatabase, this.projectDatabase), /* need to be checked */
        ]
    }
}
