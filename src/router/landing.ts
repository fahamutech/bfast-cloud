import {RestRouterAdapter, RestRouterMethod, RestRouterModel} from "../adapters/rest";

export class LandingRouter implements RestRouterAdapter {
    prefix: string = '/';

    constructor() {
    }

    getRoutes(): RestRouterModel[] {
        return [
            {
                name: 'getLandingUi',
                method: RestRouterMethod.GET,
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
