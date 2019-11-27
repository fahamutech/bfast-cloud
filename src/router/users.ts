import {RestAdapter, RestRouteMethod} from "../adapters/rest";

export class UsersRouter {
    private routerPrefix = '/users';

    constructor(private readonly restApi: RestAdapter) {
        this.getUsers();
    }

    private getUsers() {
        this.restApi.mount(this.routerPrefix, {
            method: RestRouteMethod.GET,
            path: '/',
            onRequest: [
                (request, response, next) => {
                    response.send('respond with a resource');
                }
            ]
        })
    }
}
