import {ExpressRestFactory} from "./factory/ExpressRestFactory";
import {BFastRouters} from "./router";
import {Options} from "./config/Options";
import {RestServerAdapter} from "./adapter/rest";
import {DatabaseAdapter} from "./adapter/database";
import {DatabaseConfigFactory} from "./factory/DatabaseConfigFactory";

let restServerAdapter: RestServerAdapter;
let database: DatabaseAdapter;

export class BfastCloud {

    constructor(private  options: Options) {
        restServerAdapter = this.options.restServerAdapter ?
            this.options.restServerAdapter : new ExpressRestFactory();
        database = this.options.databaseConfigAdapter ?
            this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options);

        if (!this.options.devMode) database.initiateReplicaSet();

        restServerAdapter.mountRoutes(new BFastRouters(this.options).getApiRoutes());
        restServerAdapter.startHttpServer(this.options.port);
    }

    /**
     * stop a running node js server
     */
    stop() {
        restServerAdapter.stopHttpServer();
    }
}
