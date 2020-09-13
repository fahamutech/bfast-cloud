import {ExpressRestFactory} from "./factory/ExpressRestFactory";
import {DatabaseConfigFactory} from "./factory/DatabaseConfigFactory";
import {BfastConfig} from "./configs/bfast.config";
import {RestServerAdapter} from "./adapters/rest.adapter";
import {DatabaseAdapter} from "./adapters/database.adapter";
import {BFastRouters} from "./routers/index.router";

let _restServerAdapter: RestServerAdapter;
let _database: DatabaseAdapter;

export class BfastCloud {

    constructor(private  options: BfastConfig) {
        _restServerAdapter = this.options.restServerAdapter ?
            this.options.restServerAdapter : new ExpressRestFactory();
        _database = this.options.databaseConfigAdapter ?
            this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options);

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
