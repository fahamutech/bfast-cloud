import {RestRouterAdapter, RouterMethod, RouterModel} from "../adapters/restRouter";
import {BFastControllers} from "../controller";

export class UsersRouter implements RestRouterAdapter {
    prefix: string = '/users';

    getRoutes(): RouterModel[] {
        return [
            {
                name: 'getAllUsers',
                method: RouterMethod.GET,
                path: '/',
                onRequest: [
                    (request, response, next) => {
                        BFastControllers.user().getAllUsers().then(users => {
                            response.status(200).json({users: users});
                        });
                    }
                ]
            },
            {
                name: 'createUser',
                method: RouterMethod.POST,
                path: '/',
                onRequest: [
                    (request, response, next) => {
                        const body = request.body;
                        const valid = !!(body && body.displayName && body.phoneNumber && body.email && body.password);
                        if (valid) {
                            BFastControllers.user().createUser(body).then(value => {
                                response.status(200).json(value);
                            }).catch(reason => {
                                response.status(400).json(reason);
                            })
                        } else {
                            response.status(400).json({message: 'invalid data supplied'});
                        }
                    }
                ]
            },
            {
                name: 'login',
                method: RouterMethod.POST,
                path: '/login',
                onRequest: [
                    (request, response, next) => {
                        const body = request.body;
                        const valid = !!(body && body.email && body.password);
                        if (valid) {
                            BFastControllers.user().login(body.email, body.password).then(value => {
                                response.status(200).json(value);
                            }).catch(reason => {
                                response.status(400).json(reason);
                            });
                        } else {
                            response.status(400).json({message: 'invalid data supplied'});
                        }
                    }
                ]
            }
        ];
    }
}
