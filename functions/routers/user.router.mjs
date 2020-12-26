import {bfast} from "bfastnode";

const prefix = '/users';


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
            _users.getAllUsers(size
            as
            number, skip
            as
            number
        ).
            then(users => {
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
);

/**
 *  rest: /users/admin -X POST
 *  input: --data json
 *  output: json
 * @private
 */
export const addSuperAdmin = bfast.functions().onPostHttpRequest(`${prefix}/admin`, [
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
);

