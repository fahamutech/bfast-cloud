import {RestAdapter} from "../adapters/rest";
import {FunctionsRouter} from "./functions";
import {LandingRouter} from "./landing";
import {ProjectRouter} from "./project";
import {UsersRouter} from "./users";

export class BFastRouter {
    constructor(private readonly restApi: RestAdapter) {
        new FunctionsRouter(this.restApi);
        new LandingRouter(this.restApi);
        new ProjectRouter(this.restApi);
        new UsersRouter(this.restApi);
    }

}
