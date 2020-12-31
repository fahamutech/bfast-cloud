import bfastnode from "bfastnode";
import {Options} from "../index.mjs";
import {DatabaseConfigFactory} from "../factories/database-config.factory.mjs";
import {EmailFactory} from "../factories/email.factory.mjs";
import {SecurityFactory} from "../factories/security.factory.mjs";
import {UserStoreFactory} from "../factories/user-store.factory.mjs";
import {ProjectStoreFactory} from "../factories/project-store.factory.mjs";
import {RouterGuardFactory} from "../factories/router-guard.factory.mjs";

const {bfast} = bfastnode;
const prefix = '/users';
const options = new Options();
const databaseFactory = new DatabaseConfigFactory(options.mongoURL);
const emailFactory = new EmailFactory();
const securityFactory = new SecurityFactory(options.redisHOST);
const userFactory = new UserStoreFactory(databaseFactory, emailFactory, securityFactory);
const projectFactory = new ProjectStoreFactory(databaseFactory, userFactory)
const _routerGuard = new RouterGuardFactory(userFactory, projectFactory, securityFactory, options);

/**
 *  rest: /users/me/role -X GET
 *  input: -H'Authorization': token
 *  output: json
 * @private
 */
export const getUserRole = bfast.functions().onGetHttpRequest(`${prefix}/me/role`, [
        _routerGuard.checkToken,
        (request, response) => {
            // @ts-ignore
            if (request.uid) {
                // @ts-ignore
                userFactory.getRole(request.uid).then(user => {
                    response.status(200).json(user);
                }).catch(reason => {
                    response.status(400).json(reason)
                })
            } else {
                response.status(403).json({message: 'identify yourself'})
            }
        }
    ]
);

/**
 *  rest: /users/me -X DELETE
 *  input: -H'Authorization': token
 *  output: json
 * @private
 */
export const deleteUser = bfast.functions().onDeleteHttpRequest(`${prefix}/me`, [
        _routerGuard.checkToken,
        (request, response) => {
            // @ts-ignore
            if (request.uid) {
                // @ts-ignore
                userFactory.deleteUser(request.uid).then(user => {
                    response.status(200).json(user);
                }).catch(reason => {
                    response.status(400).json(reason)
                })
            } else {
                response.status(403).json({message: 'identify yourself'})
            }
        }
    ]
);

/**
 *  rest: /users/me -X GET
 *  input: -H'Authorization': token
 *  output: json
 * @private
 */
export const getUserDetails = bfast.functions().onGetHttpRequest(`${prefix}/me`, [
        _routerGuard.checkToken,
        (request, response) => {
            // @ts-ignore
            if (request.uid) {
                // @ts-ignore
                userFactory.getUser(request.uid).then(user => {
                    response.status(200).json(user);
                }).catch(reason => {
                    response.status(400).json(reason)
                })
            } else {
                response.status(403).json({message: 'identify yourself'})
            }
        }
    ]
);

/**
 *  rest: /users/me -X PATCH
 *  input: -H'Authorization': token, --data json
 *  output: json
 * @private
 */
export const updateUserDetails = bfast.functions().onPutHttpRequest(`${prefix}/me`, [
        _routerGuard.checkToken,
        (request, response) => {
            const body = request.body;
            // @ts-ignore
            const valid = !!(request.uid && body && Object.keys(body).length > 0);
            if (valid) {
                // @ts-ignore
                userFactory.updateUserDetails(request.uid, body).then(user => {
                    response.status(200).json(user);
                }).catch(reason => {
                    response.status(400).json(reason)
                });
            } else {
                response.status(400).json({message: 'Provide information to patch'})
            }
        }
    ]
);

/**
 *  rest: /users/ -X GET
 *  input: -H'Authorization': token
 *  output: json
 * @private
 */
export const getAllUsers = bfast.functions().onGetHttpRequest(`${prefix}`, [
        _routerGuard.checkToken,
        _routerGuard.checkIsAdmin,
        (request, response, next) => {
            const size = request.query && request.query.size ? request.query.size : 20;
            const skip = request.query && request.query.skip ? request.query.skip : 0;
            userFactory.getAllUsers(parseInt(size), parseInt(skip)).then(users => {
                response.status(200).json({users: users});
            });
        }
    ]
);

/**
 *  rest: /users/ -X POST
 *  input: --data json
 *  output: json
 * @private
 */
export const createAccount = bfast.functions().onPostHttpRequest(`${prefix}`, [
        (request, response) => {
            const body = request.body;
            const valid = !!(body && body.displayName && body.phoneNumber && body.email && body.password);
            if (valid) {
                userFactory.createUser(body).then(value => {
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
);

/**
 *  rest: /users/login -X POST
 *  input: --data json
 *  output: json
 * @private
 */
export const login = bfast.functions().onPostHttpRequest(`${prefix}/login`, [
        (request, response) => {
            const body = request.body;
            const valid = !!(body && body.email && body.password);
            if (valid) {
                userFactory.login(body.email, body.password).then(value => {
                    response.status(200).json(value);
                }).catch(reason => {
                    response.status(400).json(reason);
                });
            } else {
                response.status(400).json({message: 'invalid data supplied'});
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
        // routerGuard.checkToken,
        (request, response) => {
            const body = request.body;
            const valid = !!(body && body.token);
            if (valid) {
                userFactory.logoutFromAllDevice(body.token).then(value => {
                    response.status(200).json(value);
                }).catch(reason => {
                    response.status(400).json(reason);
                });
            } else {
                response.status(400).json({message: 'invalid data supplied, token required'});
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

    // should be test by using e2e or by human for now
export const resetPassword = bfast.functions().onPostHttpRequest(`${prefix}/password/reset`, [
        (request, response) => {
            const body = request.body;
            const valid = !!(body && body.code && body.password);
            if (valid) {
                userFactory.resetPassword(body.code, body.password).then(value => {
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
                userFactory.requestResetPassword(body.email).then(value => {
                    response.status(200).json(value);
                }).catch(reason => {
                    response.status(400).json(reason);
                });
            } else {
                response.status(400).json({message: 'invalid data supplied, email required'});
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
        _routerGuard.checkMasterKey,
        (request, response) => {
            const body = request.body;
            const valid = !!(body && body.displayName && body.phoneNumber && body.email && body.password);
            if (valid) {
                userFactory.createAdmin(body).then(value => {
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
);

