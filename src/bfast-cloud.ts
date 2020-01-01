import {ExpressRestFactory} from "./factory/ExpressRestFactory";
import {BFastRouters} from "./router";
import {Options} from "./config/Options";
import {RestServerAdapter} from "./adapter/rest";
import {DatabaseAdapter} from "./adapter/database";
import {DatabaseConfigFactory} from "./factory/DatabaseConfigFactory";

export class BfastCloud {

    private readonly restServerAdapter: RestServerAdapter;
    private readonly database: DatabaseAdapter;

    constructor(private readonly options: Options) {
        this.restServerAdapter = this.options.restServerAdapter ?
            this.options.restServerAdapter : new ExpressRestFactory();
        this.database = this.options.databaseConfigAdapter ?
            this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options);

        if (!this.options.devMode) this.database.initiateReplicaSet();

        this.restServerAdapter.mountRoutes(new BFastRouters(this.options).getApiRoutes());
        this.restServerAdapter.startHttpServer(this.options.port);
    }
}
