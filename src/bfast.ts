import {RestAdapter} from "./adapters/rest";
import {ExpressRestFactory} from "./factory/ExpressRestFactory";
import {BFastRouters} from "./router";
import {DatabaseConfigurations} from "./config/database";
import {Options} from "./config/Options";

export class Bfast extends DatabaseConfigurations{
    constructor(private readonly options: Options) {
        super(options);
        if (!this.options.restAdapter) {
            this.options.restAdapter = new ExpressRestFactory();
        }
        if (this.production !== 'true') this.initiateRs();
        this.options.restAdapter.mountRoutes(new BFastRouters().getRoutes());
        this.options.restAdapter.startHttpServer(this.options.port);
    }
}
