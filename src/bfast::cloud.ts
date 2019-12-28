import {RestAdapter} from "./adapters/rest";
import {ExpressRestFactory} from "./factory/expressRestFactory";
import {BFastRouters} from "./router";
import {DatabaseConfigurations} from "./config/database";

export class BfastCloud extends DatabaseConfigurations {
    constructor(private readonly options: {
        restAdapter?: RestAdapter,
        port: string
    }) {
        super();
        if (!this.options.restAdapter) {
            this.options.restAdapter = new ExpressRestFactory();
        }
        if (this.isDebug !== 'true') this.initiateRs();
        this.options.restAdapter.mountRoutes(BFastRouters);
        this.options.restAdapter.startHttpServer(this.options.port);
    }
}
