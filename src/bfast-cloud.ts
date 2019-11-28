import {RestAdapter} from "./adapters/rest";
import {RestApiFactory} from "./factory/restApiFactory";
import {BFastRouters} from "./router";
import {DatabaseConfigurations} from "./config/mdbConfigurations";

export class BFastCloud extends DatabaseConfigurations {
    constructor(private readonly options: {
        restAdapter?: RestAdapter,
        port: string
    }) {
        super();
        if (!this.options.restAdapter) {
            this.options.restAdapter = new RestApiFactory();
        }
        if (this.isDebug !== 'true') this.initiateRs();
        this.options.restAdapter.mountRoutes(BFastRouters);
        this.options.restAdapter.startHttpServer(this.options.port);
    }


}
