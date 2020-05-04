import {ExpressRestFactory} from "./factory/ExpressRestFactory";
import {BFastRouters} from "./router";
import {BFastOptions} from "./config/BFastOptions";
import {RestServerAdapter} from "./adapter/rest";
import {DatabaseAdapter} from "./adapter/database";
import {DatabaseConfigFactory} from "./factory/DatabaseConfigFactory";

let _restServerAdapter: RestServerAdapter;
let _database: DatabaseAdapter;

export class BfastCloud {

    constructor(private  options: BFastOptions) {
        _restServerAdapter = this.options.restServerAdapter ?
            this.options.restServerAdapter : new ExpressRestFactory();
        _database = this.options.databaseConfigAdapter ?
            this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options);

        if (!this.options.devMode) _database.initiateReplicaSet();

        _restServerAdapter.mountRoutes(new BFastRouters(this.options).getApiRoutes());
        _restServerAdapter.startHttpServer(this.options.port);
    }

    /**
     * stop a running node js server
     */
    stop() {
        _restServerAdapter.stopHttpServer();
    }
}
