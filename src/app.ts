import {RestAdapter} from "./adapters/rest";
import {RestRouterAdapter} from "./adapters/restRouter";
import {RestApiFactory} from "./factory/restApiFactory";

export class BFastCloud {
    constructor(private readonly options: {
        restAdapter?: RestAdapter,
        routers: RestRouterAdapter[],
        port: string
    }) {
        if (!this.options.restAdapter) {
            this.options.restAdapter = new RestApiFactory();
        }
        this.options.restAdapter.mountRoutes(this.options.routers);
        this.options.restAdapter.startHttpServer(this.options.port);
    }
}
