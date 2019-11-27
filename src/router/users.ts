import {RestRouterAdapter, RouterMethod, RouterModel} from "../adapters/restRouter";

export class UsersRouter implements RestRouterAdapter {
    prefix: string = '/users';

    getRoutes(): RouterModel[] {
        return [
            {
                name: 'getUsers',
                method: RouterMethod.GET,
                path: '/',
                onRequest: [
                    (request, response, next) => {
                        response.send('respond with a resource');
                    }
                ]
            }
        ];
    }
}
