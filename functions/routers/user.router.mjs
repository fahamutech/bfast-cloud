import bfast from "bfast";
import {Options} from "../options.mjs";
import {DatabaseConfigFactory} from "../factories/database-config.factory.mjs";
import {EmailFactory} from "../factories/email.factory.mjs";
import {SecurityFactory} from "../factories/security.factory.mjs";
import {UserStoreFactory} from "../factories/user-store.factory.mjs";
import {ProjectStoreFactory} from "../factories/project-store.factory.mjs";
import {RouterGuardFactory} from "../factories/router-guard.factory.mjs";

const prefix = '/users';
const options = new Options();
const databaseFactory = new DatabaseConfigFactory(options.databaseURI);
const emailFactory = new EmailFactory();
const securityFactory = new SecurityFactory();
const userFactory = new UserStoreFactory(emailFactory, securityFactory);
const projectFactory = new ProjectStoreFactory(databaseFactory, options.containerOrchAdapter(), securityFactory);
const routerGuard = new RouterGuardFactory(userFactory, projectFactory, securityFactory, options);

export const getUserRole = bfast.functions().onGetHttpRequest(`${prefix}/me/role`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response) => {
            if (request.uid) {
                userFactory.getRole(request.uid).then(user => {
                    response.status(200).json(user);
                }).catch(reason => {
                    // console.log(reason);
                    response.status(400).send(reason)
                })
            } else {
                response.status(403).send({message: 'identify yourself'})
            }
        }
    ]
);

export const deleteUser = bfast.functions().onDeleteHttpRequest(`${prefix}/me`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response) => {
            if (request.uid) {
                userFactory.deleteUser(request.uid).then(user => {
                    response.status(200).json(user);
                }).catch(reason => {
                    response.status(400).send(reason)
                })
            } else {
                response.status(403).send({message: 'identify yourself'})
            }
        }
    ]
);

export const getUserDetails = bfast.functions().onGetHttpRequest(`${prefix}/me`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response) => {
            if (request.uid) {
                userFactory.getUser(request.uid).then(user => {
                    response.status(200).json(user);
                }).catch(reason => {
                    response.status(400).send(reason)
                })
            } else {
                response.status(403).send({message: 'identify yourself'})
            }
        }
    ]
);

export const updateUserDetails = bfast.functions().onPutHttpRequest(`${prefix}/me`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response) => {
            const body = request.body;
            const valid = !!(request.uid && body && Object.keys(body).length > 0);
            if (valid) {
                userFactory.updateUserDetails(request.uid, body).then(user => {
                    response.status(200).json(user);
                }).catch(reason => {
                    response.status(400).send(reason)
                });
            } else {
                response.status(400).send({message: 'Provide information to patch'})
            }
        }
    ]
);

export const getAllUsers = bfast.functions().onGetHttpRequest(`${prefix}`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        }, (request, response, next) => {
            routerGuard.checkIsAdmin(request, response, next);
        },
        (request, response, next) => {
            const size = request.query && request.query.size ? request.query.size : 20;
            const skip = request.query && request.query.skip ? request.query.skip : 0;
            userFactory.getAllUsers().then(users => {
                response.status(200).json(users);
            });
        }
    ]
);

const handleCreateUser = [
    (request, response) => {
        const body = request.body;
        const valid = !!(body && body.displayName && body.phoneNumber && body.email && body.password);
        if (valid) {
            userFactory.createUser(body).then(value => {
                response.status(200).json(value);
            }).catch(reason => {
                response.status(400).send(reason);
            });
        } else {
            response.status(400).send({
                message: 'invalid data supplied, displayName, phoneNumber, email and password required'
            });
        }
    }
]

export const createAccount = bfast.functions().onPostHttpRequest(`${prefix}`, handleCreateUser);

export const createAccountV2 = bfast.functions().onPostHttpRequest(`${prefix}/register`, handleCreateUser);

export const login = bfast.functions().onPostHttpRequest(`${prefix}/login`, [
        (request, response) => {
            const body = request.body;
            const valid = !!(body && body.email && body.password);
            if (valid) {
                userFactory.login(body.email, body.password).then(value => {
                    response.status(200).json(value);
                }).catch(reason => {
                    response.status(400).send(reason);
                });
            } else {
                response.status(400).send({message: 'invalid data supplied'});
            }
        }
    ]
);

/**
 *  rest: /users/logout -X POST
 *  input: --data json
 *  output: json
 * @private
 */
export const logout = bfast.functions().onPostHttpRequest(`${prefix}/logout`, [
        (request, response) => {
            const body = request.body;
            const valid = !!(body && body.token);
            if (valid) {
                userFactory.logoutFromAllDevice(body.token).then(value => {
                    response.status(200).json(value);
                }).catch(reason => {
                    response.status(400).send(reason);
                });
            } else {
                response.status(400).send({message: 'invalid data supplied, token required'});
            }
        }
    ]
);

/**
 *  rest: /users/password/reset -X POST
 *  input: --data json
 *  output: json
 * @private
 */

export const resetPassword = bfast.functions().onPostHttpRequest(`${prefix}/password/reset`, [
            (request, response) => {
                const body = request.body;
                const valid = !!(body && body.code && body.password);
                if (valid) {
                    userFactory.resetPassword(body.code, body.password).then(value => {
                        response.status(200).json(value);
                    }).catch(reason => {
                        console.log(reason);
                        response.status(400).send(reason);
                    })
                } else {
                    response.status(400).send({message: 'invalid data supplied'});
                }
            }
        ]
);

/**
 *  rest: /users/password/request -X POST
 *  input: --data json
 *  output: json
 * @private
 */
export const requestResetPasswordCode = bfast.functions().onPostHttpRequest(`${prefix}/password/request`, [
        (request, response) => {
            const body = request.body;
            const valid = !!(body && body.email);
            if (valid) {
                userFactory.requestResetPassword(body.email, body.local === true).then(value => {
                    response.status(200).json(value);
                }).catch(reason => {
                    // console.log(reason);
                    response.status(400).send(reason);
                });
            } else {
                response.status(400).send({message: 'invalid data supplied, email required'});
            }
        }
    ]
);

/**
 * create a super admin user by using master key
 *  rest: /users/admin -X POST
 *  input: --data json
 *  output: json
 */
export const addSuperAdmin = bfast.functions().onPostHttpRequest(`${prefix}/admin`, [
        (request, response, next) => {
            routerGuard.checkMasterKey(request, response, next);
        },
        (request, response) => {
            const body = request.body;
            const valid = !!(body && body.displayName && body.phoneNumber && body.email && body.password);
            if (valid) {
                userFactory.createAdmin(body).then(value => {
                    response.json(value);
                }).catch(reason => {
                    response.status(400).send(reason);
                });
            } else {
                response.status(400).send({
                    message: 'invalid data supplied, displayName, phoneNumber, email and password required'
                });
            }
        }
    ]
);

