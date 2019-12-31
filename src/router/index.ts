import {RestRouterModel} from "../adapters/rest";
import {Options} from "../config/Options";
import {ProjectDatabaseAdapter, UsersDatabaseAdapter} from "../adapters/database";

export class BFastRouters {
    constructor(private readonly options: Options,
                private readonly userDatabase: UsersDatabaseAdapter,
                private readonly projectDatabase: ProjectDatabaseAdapter,
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
