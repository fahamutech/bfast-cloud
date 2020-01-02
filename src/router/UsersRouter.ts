import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapter/rest";
import {Options} from "../config/Options";
import {UserController} from "../controller/UserController";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";

let users: UserController;
let routerGuard: RouterGuardAdapter;

export class UsersRouter implements RestRouterAdapter {
    prefix: string = '/users';

    constructor(private readonly options: Options) {
        users = new UserController(this.options);
        routerGuard = this.options.routerGuard !== undefined ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
    }

    getRoutes(): RestRouterModel[] {
        return [
            this._addSuperAdmin(),
            this._getUserRole(),
            this._getUserDetails(),
            this._deleteUser(),
            this._updateUserDetails(),
            this._getAllUsers(),
            this._createAccount(),
            this._login(),
            this._logout(),
            this._requestResetPasswordCode(),
            this._resetPassword(),
        ];
    }

    /**
     *  rest: /users/me/role -X GET
     *  input: -H'Authorization': token
     *  output: json
     * @private
     */
    private _getUserRole(): RestRouterModel {
        return {
            name: 'getUserRole',
            method: RestRouterMethod.GET,
            path: '/me/role',
            onRequest: [
                routerGuard.checkToken,
                (request, response) => {
                    // @ts-ignore
                    if (request.uid) {
                        // @ts-ignore
                        users.getRole(request.uid).then(user => {
                            response.status(200).json(user);
                        }).catch(reason => {
                            response.status(400).json(reason)
                        })
                    } else {
                        response.status(403).json({message: 'identify yourself'})
                    }
                }
            ]
        };
    }

    /**
     *  rest: /users/me -X DELETE
     *  input: -H'Authorization': token
     *  output: json
     * @private
     */
    private _deleteUser(): RestRouterModel {
        return {
            name: 'deleteUser',
            method: RestRouterMethod.DELETE,
            path: '/me',
            onRequest: [
                routerGuard.checkToken,
                (request, response) => {
                    // @ts-ignore
                    if (request.uid) {
                        // @ts-ignore
                        users.deleteUser(request.uid).then(user => {
                            response.status(200).json(user);
                        }).catch(reason => {
                            response.status(400).json(reason)
                        })
                    } else {
                        response.status(403).json({message: 'identify yourself'})
                    }
                }
            ]
        };
    }

    /**
     *  rest: /users/me -X GET
     *  input: -H'Authorization': token
     *  output: json
     * @private
     */
    private _getUserDetails(): RestRouterModel {
        return {
            name: 'getUserDetails',
            method: RestRouterMethod.GET,
            path: '/me',
            onRequest: [
                routerGuard.checkToken,
                (request, response) => {
                    // @ts-ignore
                    if (request.uid) {
                        // @ts-ignore
                        users.getUser(request.uid).then(user => {
                            response.status(200).json(user);
                        }).catch(reason => {
                            response.status(400).json(reason)
                        })
                    } else {
                        response.status(403).json({message: 'identify yourself'})
                    }
                }
            ]
        };
    }

    /**
     *  rest: /users/me -X PATCH
     *  input: -H'Authorization': token, --data json
     *  output: json
     * @private
     */
    private _updateUserDetails(): RestRouterModel {
        return {
            name: 'updateUserDetails',
            method: RestRouterMethod.PATCH,
            path: '/me',
            onRequest: [
                routerGuard.checkToken,
                (request, response) => {
                    const body = request.body;
                    // @ts-ignore
                    const valid = !!(request.uid && body && Object.keys(body).length > 0);
                    if (valid) {
                        // @ts-ignore
                        users.updateUserDetails(request.uid, body).then(user => {
                            response.status(200).json(user);
                        }).catch(reason => {
                            response.status(400).json(reason)
                        });
                    } else {
                        response.status(400).json({message: 'Provide information to patch'})
                    }
                }
            ]
        };
    }

    /**
     *  rest: /users/ -X GET
     *  input: -H'Authorization': token
     *  output: json
     * @private
     */
    private _getAllUsers(): RestRouterModel {
        return {
            name: 'getAllUsers',
            method: RestRouterMethod.GET,
            path: '/',
            onRequest: [
                routerGuard.checkToken,
                routerGuard.checkIsAdmin,
                (request, response, next) => {
                    const size = request.query && request.query.size ? request.query.size : 20;
                    const skip = request.query && request.query.skip ? request.query.skip : 0;
                    users.getAllUsers(size, skip).then(users => {
                        response.status(200).json({users: users});
                    });
                }
            ]
        };
    }

    /**
     *  rest: /users/ -X POST
     *  input: --data json
     *  output: json
     * @private
     */
    private _createAccount(): RestRouterModel {
        return {
            name: 'createUserAccount',
            method: RestRouterMethod.POST,
            path: '/',
            onRequest: [
                (request, response) => {
                    const body = request.body;
                    const valid = !!(body && body.displayName && body.phoneNumber && body.email && body.password);
                    if (valid) {
                        users.createUser(body).then(value => {
                            response.status(200).json(value);
                        }).catch(reason => {
                            response.status(400).json(reason);
                        });
                    } else {
                        response.status(400).json({
                            message: 'invalid data supplied, displayName, phoneNumber, email and password required'
                        });
                    }
                }
            ]
        }
    }

    /**
     *  rest: /users/login -X POST
     *  input: --data json
     *  output: json
     * @private
     */
    private _login(): RestRouterModel {
        return {
            name: 'login',
            method: RestRouterMethod.POST,
            path: '/login',
            onRequest: [
                (request, response) => {
                    const body = request.body;
                    const valid = !!(body && body.email && body.password);
                    if (valid) {
                        users.login(body.email, body.password).then(value => {
                            response.status(200).json(value);
                        }).catch(reason => {
                            response.status(400).json(reason);
                        });
                    } else {
                        response.status(400).json({message: 'invalid data supplied'});
                    }
                }
            ]
        };
    }

    /**
     *  rest: /users/logout -X POST
     *  input: --data json
     *  output: json
     * @private
     */
    private _logout(): RestRouterModel {
        return {
            name: 'logout',
            method: RestRouterMethod.POST,
            path: '/logout',
            onRequest: [
                // routerGuard.checkToken,
                (request, response) => {
                    const body = request.body;
                    const valid = !!(body && body.token);
                    if (valid) {
                        users.logoutFromAllDevice(body.token).then(value => {
                            response.status(200).json(value);
                        }).catch(reason => {
                            response.status(400).json(reason);
                        });
                    } else {
                        response.status(400).json({message: 'invalid data supplied, token required'});
                    }
                }
            ]
        };
    }

    /**
     *  rest: /users/me -X POST
     *  input: --data json
     *  output: json
     * @private
     */
    private _resetPassword(): RestRouterModel {
        return {
            name: 'resetPassword',
            method: RestRouterMethod.POST,
            path: '/resetPassword',
            onRequest: [
                (request, response) => {
                    const body = request.body;
                    const valid = !!(body && body.email && body.code && body.password);
                    if (valid) {
                        users.resetPassword(body.email, body.code, body.password).then(value => {
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
    }

    /**
     *  rest: /users/requestPasswordResetCode -X POST
     *  input: --data json
     *  output: json
     * @private
     */
    private _requestResetPasswordCode(): RestRouterModel {
        return {
            name: 'requestResetPasswordCode',
            method: RestRouterMethod.POST,
            path: '/requestPasswordResetCode',
            onRequest: [
                (request, response) => {
                    const body = request.body;
                    const valid = !!(body && body.email);
                    if (valid) {
                        users.requestResetPassword(body.email).then(value => {
                            response.status(200).json(value);
                        }).catch(reason => {
                            response.status(400).json(reason);
                        })
                    } else {
                        response.status(400).json({message: 'invalid data supplied, email required'});
                    }
                }
            ]
        }
    }

    /**
     *  rest: /users/admin -X POST
     *  input: --data json
     *  output: json
     * @private
     */
    private _addSuperAdmin(): RestRouterModel {
        return {
            name: 'addSuperAdmin',
            method: RestRouterMethod.POST,
            path: '/admin',
            onRequest: [
                routerGuard.checkMasterKey,
                (request, response) => {
                    const body = request.body;
                    const valid = !!(body && body.displayName && body.phoneNumber && body.email && body.password);
                    if (valid) {
                        users.createAdmin(body).then(value => {
                            response.status(200).json(value);
                        }).catch(reason => {
                            response.status(400).json(reason);
                        });
                    } else {
                        response.status(400).json({
                            message: 'invalid data supplied, displayName, phoneNumber, email and password required'
                        });
                    }
                }
            ]
        };
    }
}
