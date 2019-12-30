import {BFastControllers} from "../controller";
import {RolesBasedRestRouter} from "../factory/RolesBasedRestRouter";
import {RestRouterAdapter, RestRouterMethod, RestRouterModel} from "../adapters/rest";

export class UsersRouter extends RolesBasedRestRouter implements RestRouterAdapter {
    prefix: string = '/users';

    getRoutes(): RestRouterModel[] {
        return [
            {
                name: 'getUserDetails',
                method: RestRouterMethod.GET,
                path: '/me',
                onRequest: [
                    this.checkToken,
                    (request, response) => {
                        if (request.uid) {
                            BFastControllers.user().getUser(request.uid).then(user => {
                                response.status(200).json(user);
                            }).catch(reason => {
                                response.status(400).json(reason)
                            })
                        } else {
                            response.status(403).json({message: 'identify yourself'})
                        }
                    }
                ]
            },
            {
                name: 'updateUserDetails',
                method: RestRouterMethod.PATCH,
                path: '/me',
                onRequest: [
                    this.checkToken,
                    (request, response) => {
                        const body = request.body;
                        const valid = !!(request.uid && body && Object.keys(body).length > 0);
                        if (valid) {
                            BFastControllers.user().updateUserDetails(request.uid, body).then(user => {
                                response.status(200).json(user);
                            }).catch(reason => {
                                response.status(400).json(reason)
                            })
                        } else {
                            response.status(400).json({message: 'Provide information to patch'})
                        }
                    }
                ]
            },
            {
                name: 'getAllUsers',
                method: RestRouterMethod.GET,
                path: '/',
                onRequest: [
                    this.checkToken,
                    this.checkIsAdmin,
                    (request, response, next) => {
                        BFastControllers.user().getAllUsers().then(users => {
                            response.status(200).json({users: users});
                        });
                    }
                ]
            },
            {
                name: 'createUserAccount',
                method: RestRouterMethod.POST,
                path: '/',
                onRequest: [
                    (request, response) => {
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
                method: RestRouterMethod.POST,
                path: '/login',
                onRequest: [
                    (request, response) => {
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
            },
            {
                name: 'resetPassword',
                method: RestRouterMethod.POST,
                path: '/reset',
                onRequest: [
                    (request, response) => {
                        const body = request.body;
                        const valid = !!(body && body.email);
                        if (valid) {
                            BFastControllers.user().requestResetPassword(body.email).then(value => {
                                response.status(200).json(value);
                            }).catch(reason => {
                                response.status(400).json(reason);
                            })
                        } else {
                            response.status(400).json({message: 'invalid data supplied'});
                        }
                    }
                ]
            }
        ];
    }
}
