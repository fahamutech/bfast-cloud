import {RestRouterAdapter, RouterMethod, RouterModel} from "../adapters/restRouter";

export class LandingRouter implements RestRouterAdapter {
    prefix: string = '/';

    constructor() {
    }

    getRoutes(): RouterModel[] {
        return [
            {
                name: 'getLandingUi',
                method: RouterMethod.GET,
                path: '/',
                onRequest: [
                    (request, response, _) => {
                        response.sendFile(`${__dirname}/../public/index.html`);
                    }
                ]
            }
        ];
    }
}
