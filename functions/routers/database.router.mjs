import bfastnode from "bfastnode";
import {Options} from "../options.mjs";
import {DatabaseConfigFactory} from "../factories/database-config.factory.mjs";
import {EmailFactory} from "../factories/email.factory.mjs";
import {SecurityFactory} from "../factories/security.factory.mjs";
import {UserStoreFactory} from "../factories/user-store.factory.mjs";
import {ProjectStoreFactory} from "../factories/project-store.factory.mjs";
import {RouterGuardFactory} from "../factories/router-guard.factory.mjs";
import {DatabasesInstanceController} from "../controllers/databases-instance.controller.mjs";

const {bfast} = bfastnode;
const options = new Options();
const databaseOrch = new DatabasesInstanceController(options.containerOrchAdapter());
const databaseFactory = new DatabaseConfigFactory(options.mongoURL);
const emailFactory = new EmailFactory();
const securityFactory = new SecurityFactory();
const userFactory = new UserStoreFactory(databaseFactory, emailFactory, securityFactory);
const projectFactory = new ProjectStoreFactory(databaseFactory, userFactory, options.containerOrchAdapter());
const routerGuard = new RouterGuardFactory(userFactory, projectFactory, securityFactory, options);


const prefix = '/projects/:projectId/database';

export const updateImage = bfast.functions().onPostHttpRequest(`${prefix}/image`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwner(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkPayment(request, response, next);
        },
        (request, response) => {
            databaseOrch.updateImage(
                request.params.projectId, request.body.image,
                request.query.force === 'true'
            ).then(value => {
                response.status(200).send(value);
            }).catch(reason => {
                response.status(400).json(reason);
            });
        }
    ]
);

/**
 *  rest: /database/:projectId/env?force= -X DELETE
 *  input:  -H'Authorization': token
 *  output: json
 * @private
 */
export const removeEnvironment = bfast.functions().onDeleteHttpRequest(`${prefix}/env`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            const body = request.body;
            const valid = (body && body.envs && Array.isArray(body.envs) && body.envs.length > 0);
            if (valid) {
                databaseOrch.envRemove(request.params.projectId, request.body.envs,
                    request.query.force === 'true', request.query.daemon === 'true').then(_ => {
                    response.status(200).json({message: 'envs updated'});
                }).catch(reason => {
                    response.status(400).json({message: 'fails to remove envs', reason: reason.toString()});
                });
            } else {
                response.status(400).json({message: 'Nothing to update'})
            }
        }
    ]
);

/**
 *  rest: /database/:projectId/env?force= -X POST
 *  input:  -H'Authorization': token, --data json
 *  output: json
 * @private
 */
export const addEnvironment = bfast.functions().onPostHttpRequest(`${prefix}/env`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            databaseOrch.envAdd(request.params.projectId,
                request.body.envs, request.query.force === 'true', request.query.daemon === 'true').then(_ => {
                response.status(200).json({message: 'envs updated'});
            }).catch(reason => {
                response.status(400).json({message: 'fails to add envs', reason: reason.toString()});
            });
        }
    ]
);


export const getDaasInfo = bfast.functions().onGetHttpRequest(
    `${prefix}`,
    [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            const service = `${request.params.projectId}_daas`;
            databaseOrch.info(service).then(value => {
                response.status(200).json(value);
            }).catch(reason => {
                console.log(reason);
                response.status(400).json({message: 'fails to get info', reason: reason.toString()});
            })
        }
    ]
);

export const getDaasEnvs = bfast.functions().onGetHttpRequest(
    `${prefix}/env`,
    [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            const service = `${request.params.projectId}_daas`;
            databaseOrch.envs(service).then(value => {
                response.status(200).json(value);
            }).catch(reason => {
                console.log(reason);
                response.status(400).json({message: 'fails to get info', reason: reason.toString()});
            })
        }
    ]
);
