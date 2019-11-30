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
                    (request, response) => {
                        response.status(200).json({message: 'welcome to secure bfast::cloud'})
                    }
                ]
            }
        ];
    }
}
