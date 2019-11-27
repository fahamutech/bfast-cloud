import {RestAdapter, RestRouteMethod} from "../adapters/rest";

export class LandingRouter {
    private routerPrefix = '/';

    constructor(private readonly restApi: RestAdapter) {
        this.getLandingUi();
    }

    private getLandingUi() {
        this.restApi.mount(this.routerPrefix, {
            method: RestRouteMethod.GET,
            path: '',
            onRequest: [
                (request, response, _) => {
                    response.sendFile(`${__dirname}/../public/index.html`);
                }
            ]
        })
    }
}
