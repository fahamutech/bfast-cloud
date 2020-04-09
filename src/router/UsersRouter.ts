import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapter/rest";
import {Options} from "../config/Options";
import {UserController} from "../controller/UserController";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";

let _users: UserController;
let _routerGuard: RouterGuardAdapter;

export class UsersRouter implements RestRouterAdapter {
    prefix: string = '/users';

    constructor(private readonly options: Options) {
        _users = new UserController(this.options);
        _routerGuard = this.options.routerGuard !== undefined ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
    }

    getRoutes(): RestRouterModel[] {
        return [
            this._addSuperAdmin(),
            this._getUserRole(),
            this._getUserDetails(),
            this._deleteUser(),
            this._updateUserDetails(),
            this._getAllUsers(), /*need more test*/
            this._createAccount(),
            this._login(),
            this._logout(),
            this._requestResetPasswordCode(), /*need more test*/
            this._resetPassword(),  /*need more test*/
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
                _routerGuard.checkToken,
                (request, response) => {
                    // @ts-ignore
                    if (request.uid) {
                        // @ts-ignore
                        _users.getRole(request.uid).then(user => {
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
                _routerGuard.checkToken,
                (request, response) => {
                    // @ts-ignore
                    if (request.uid) {
                        // @ts-ignore
                        _users.deleteUser(request.uid).then(user => {
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
                _routerGuard.checkToken,
                (request, response) => {
                    // @ts-ignore
                    if (request.uid) {
                        // @ts-ignore
                        _users.getUser(request.uid).then(user => {
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
                _routerGuard.checkToken,
                (request, response) => {
                    const body = request.body;
                    // @ts-ignore
                    const valid = !!(request.uid && body && Object.keys(body).length > 0);
                    if (valid) {
                        // @ts-ignore
                        _users.updateUserDetails(request.uid, body).then(user => {
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
                _routerGuard.checkToken,
                _routerGuard.checkIsAdmin,
                (request, response, next) => {
                    const size = request.query && request.query.size ? request.query.size : 20;
                    const skip = request.query && request.query.skip ? request.query.skip : 0;
                    _users.getAllUsers(size as number, skip as number).then(users => {
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
                        _users.createUser(body).then(value => {
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
                        _users.login(body.email, body.password).then(value => {
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
                        _users.logoutFromAllDevice(body.token).then(value => {
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
     *  rest: /users/password/reset -X POST
     *  input: --data json
     *  output: json
     * @private
     */

    // should be test by using e2e or by human for now
    private _resetPassword(): RestRouterModel {
        return {
            name: 'resetPassword',
            method: RestRouterMethod.POST,
            path: '/password/reset',
            onRequest: [
                (request, response) => {
                    const body = request.body;
                    const valid = !!(body && body.code && body.password);
                    if (valid) {
                        _users.resetPassword(body.code, body.password).then(value => {
                            response.status(200).json(value);
                        }).catch(reason => {
                            console.log(reason);
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
     *  rest: /users/password/request -X POST
     *  input: --data json
     *  output: json
     * @private
     */
    private _requestResetPasswordCode(): RestRouterModel {
        return {
            name: 'requestResetPasswordCode',
            method: RestRouterMethod.POST,
            path: '/password/request',
            onRequest: [
                (request, response) => {
                    const body = request.body;
                    const valid = !!(body && body.email);
                    if (valid) {
                        _users.requestResetPassword(body.email).then(value => {
                            response.status(200).json(value);
                        }).catch(reason => {
                            response.status(400).json(reason);
                        });
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
                _routerGuard.checkMasterKey,
                (request, response) => {
                    const body = request.body;
                    const valid = !!(body && body.displayName && body.phoneNumber && body.email && body.password);
                    if (valid) {
                        _users.createAdmin(body).then(value => {
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
