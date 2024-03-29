import bfast from "bfast";
import {Options} from "../../src/options.mjs";
import {DatabaseConfigFactory} from "../../src/factories/database-config.factory.mjs";
import {EmailFactory} from "../../src/factories/email.factory.mjs";
import {SecurityFactory} from "../../src/factories/security.factory.mjs";
import {UserStoreFactory} from "../../src/factories/user-store.factory.mjs";
import {ProjectStoreFactory} from "../../src/factories/project-store.factory.mjs";
import {RouterGuardFactory} from "../../src/factories/router-guard.factory.mjs";
import {FunctionsInstanceController} from "../../src/controllers/functions-instance.controller.mjs";


const options = new Options();
const functionsOrch = new FunctionsInstanceController(options.containerOrchAdapter());
const databaseFactory = new DatabaseConfigFactory(options.databaseURI);
const emailFactory = new EmailFactory();
const securityFactory = new SecurityFactory();
const userFactory = new UserStoreFactory(emailFactory, securityFactory);
const projectFactory = new ProjectStoreFactory(databaseFactory, options.containerOrchAdapter(), securityFactory);
const routerGuard = new RouterGuardFactory(userFactory, projectFactory, securityFactory, options);
const prefix = '/projects/:projectId/functions';

export const removeFunctionsEnvironment = bfast.functions().onDeleteHttpRequest(`${prefix}/env`, [
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
                functionsOrch
                    .envRemove(request.params.projectId, request.body.envs, request.query.force === 'true').then(value => {
                    response.status(200).json({message: 'envs updated'});
                }).catch(reason => {
                    response.status(503).send({message: 'fails to remove envs', reason: reason.toString()});
                });
            } else {
                response.status(400).send({message: 'Nothing to update'})
            }
        }
    ]
);

export const addFunctionsEnvironment = bfast.functions().onPostHttpRequest(`${prefix}/env`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            functionsOrch
                .envAdd(request.params.projectId, request.body.envs, request.query.force === 'true').then(value => {
                response.status(200).json({message: 'envs updated'});
            }).catch(reason => {
                response.status(400).send({message: reason && reason.message ? reason.message : reason.toString()});
            });
        }
    ]
);

export const deployFunctions = bfast.functions().onPostHttpRequest(`${prefix}`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            functionsOrch.deploy(request.params.projectId, request.query.force === 'true').then(value => {
                response.status(200).json({message: 'functions deployed'});
            }).catch(reason => {
                response.status(503).send(reason);
            });
        }
    ]
);


export const addDomainToFunctions = bfast.functions().onPostHttpRequest(`${prefix}/domain`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            functionsOrch.addDomain(request.params.projectId, request.body.domain, request.query.force === 'true').then(value => {
                response.status(200).json({message: 'domain added'});
            }).catch(reason => {
                response.status(503).send(reason);
            });
        }
    ]
);

export const removeDomainToFunctions = bfast.functions().onDeleteHttpRequest(`${prefix}/domain`, [
    (request, response, next) => {
        routerGuard.checkToken(request, response, next);
    },
    (request, response, next) => {
        routerGuard.checkIsProjectOwnerOrMember(request, response, next);
    },
    (request, response) => {
        functionsOrch.removeDomain(request.params.projectId, request.query.force === 'true').then(value => {
            response.status(200).json({message: 'domain added'});
        }).catch(reason => {
            response.status(503).send(reason);
        });
    }
]);

export const functionsSwitch = bfast.functions().onPostHttpRequest(`${prefix}/switch/:mode`, [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            const mode = request.params.mode;
            if (mode.toString() === '0') {
                functionsOrch.faasOff(request.params.projectId, request.query.force === 'true').then(value => {
                    response.status(200).json({message: 'faas engine switched off'});
                }).catch(reason => {
                    response.status(503).send(reason);
                });
            } else if (mode.toString() === '1') {
                functionsOrch.faasOn(request.params.projectId, request.query.force === 'true').then(value => {
                    response.status(200).json({message: 'faas engine switch on'});
                }).catch(reason => {
                    response.status(503).send(reason);
                });
            } else {
                response.status(400).send({message: 'Action not known'});
            }
        }
    ]
);

export const getFaasInfo = bfast.functions().onGetHttpRequest(
    `${prefix}`,
    [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            functionsOrch.info(`${request.params.projectId}_faas`).then(value => {
                response.status(200).json(value);
            }).catch(reason => {
                response.status(400).send({message: 'fails to get info', reason: reason.toString()});
            })
        }
    ]
);


export const getFaasEnvs = bfast.functions().onGetHttpRequest(
    `${prefix}/env`,
    [
        (request, response, next) => {
            routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            routerGuard.checkIsProjectOwnerOrMember(request, response, next);
        },
        (request, response) => {
            const service = `${request.params.projectId}_faas`;
            functionsOrch.envs(service).then(value => {
                response.status(200).json(value);
            }).catch(reason => {
                console.log(reason);
                response.status(400).send({message: 'fails to get info', reason: reason.toString()});
            });
        }
    ]
);
