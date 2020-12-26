import {ExpressRestFactory} from "./factories/express-rest.factory";
import {BfastConfig} from "./configs/bfast.config.mjs";
import {RestServerAdapter} from "./adapters/rest.adapter.mjs";
import {BFastRouters} from "./routers/index.router.mjs";

let _restServerAdapter;

// let _database: DatabaseAdapter;

export class BfastCloud {

    /**
     *
     * @param options - {BfastConfig}
     */
    constructor(options) {
        this.options = options;
        _restServerAdapter = this.options.restServerAdapter ?
            this.options.restServerAdapter : new ExpressRestFactory();
        // _database = this.options.databaseConfigAdapter ?
        //     this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options);

        // _restServerAdapter.mountRoutes(new BFastRouters(this.options).getApiRoutes());
        // _restServerAdapter.startHttpServer(this.options.port);
    }

    /**
     * stop a running node js server
     */
    stop() {
        // _restServerAdapter.stopHttpServer();
    }
}
