import {RestRouterAdapter, RestRouterMethod, RestRouterModel} from "../adapter/rest";

export class LandingRouter implements RestRouterAdapter {
    prefix: string = '/';

    constructor() {
    }

    getRoutes(): RestRouterModel[] {
        return [
            this._landing(),
        ];
    }

    /**
     *  rest: / -X GET
     *  input: N/A
     *  output: json
     * @private
     */
    private _landing(): RestRouterModel {
        return {
            name: 'getLandingUi',
            method: RestRouterMethod.GET,
            path: '/',
            onRequest: [
                (request, response) => {
                    response.status(200).json({message: 'welcome to secured bfast::cloud'});
                }
            ]
        };
    }
}
