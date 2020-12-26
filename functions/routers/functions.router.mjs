import {bfast} from "bfastnode";


const prefix = '/projects/:projectId/functions';

// constructor(private  options: BfastConfig) {
//     routerGuard = this.options.routerGuard ?
//         this.options.routerGuard : new RouterGuardFactory(this.options);
//     functions = new FunctionsController(this.options);
// }


/**
 *  rest: /projects/:projectId/functions/:projectId/env?force= -X DELETE
 *  input:  -H'Authorization': token
 *  output: json
 * @private
 */
export const removeFunctionsEnvironment = bfast.functions().onDeleteHttpRequest(`${prefix}/env`, [
        routerGuard.checkToken,
        routerGuard.checkIsProjectOwner,
        (request, response) => {
            const body = request.body;
            const valid = (body && body.envs && Array.isArray(body.envs) && body.envs.length > 0);
            if (valid) {
                functions
                    .envRemove(request.params.projectId, request.body.envs, request.query.force === 'true').then(value => {
                    response.status(200).json({message: 'envs updated'});
                }).catch(reason => {
                    response.status(503).json({message: 'fails to remove envs', reason: reason.toString()});
                });
            } else {
                response.status(400).json({message: 'Nothing to update'})
            }
        }
    ]
);

/**
 *  rest: /functions/:projectId/env?force= -X POST
 *  input:  -H'Authorization': token, --data json
 *  output: json
 * @private
 */
export const addFunctionsEnvironment = bfast.functions().onPostHttpRequest(`${prefix}/env`, [
        routerGuard.checkToken,
        routerGuard.checkIsProjectOwner,
        (request, response) => {
            functions
                .envAdd(request.params.projectId, request.body.envs, request.query.force === 'true').then(value => {
                response.status(200).json({message: 'envs updated'});
            }).catch(reason => {
                response.status(503).json({message: 'fails to add envs', reason: reason.toString()});
            });
        }
    ]
);

/**
 *  rest: /functions/:projectId?force= -X POST
 *  input:  -H'Authorization': token
 *  output: json
 * @private
 */
export const deployFunctions = bfast.functions().onPostHttpRequest(`${prefix}`, [
        routerGuard.checkToken,
        routerGuard.checkIsProjectOwner,
        (request, response) => {
            functions.deploy(request.params.projectId, request.query.force === 'true').then(value => {
                response.status(200).json({message: 'functions deployed'});
            }).catch(reason => {
                response.status(503).json(reason);
            });
        }
    ]
);

/**
 *  rest: /functions/:projectId/domain?force= -X POST
 *  headers:  -H'Authorization': token
 *  input: {domain: string}
 *  output: json
 * @private
 */
export const addDomainToFunctions = bfast.functions().onPostHttpRequest(`${prefix}/domain`, [
        routerGuard.checkToken,
        routerGuard.checkIsProjectOwner,
        (request, response) => {
            functions.addDomain(request.params.projectId, request.body.domain, request.query.force === 'true').then(value => {
                response.status(200).json({message: 'domain added'});
            }).catch(reason => {
                response.status(503).json(reason);
            });
        }
    ]
);

/**
 *  rest: /functions/:projectId/domain?force= -X DELETE
 *  headers:  -H'Authorization': token
 *  output: json
 * @private
 */
export const removeDomainToFunctions = bfast.functions().onDeleteHttpRequest(`${prefix}/domain`, [
    routerGuard.checkToken,
    routerGuard.checkIsProjectOwner,
    (request, response) => {
        functions.removeDomain(request.params.projectId, request.query.force === 'true').then(value => {
            response.status(200).json({message: 'domain added'});
        }).catch(reason => {
            response.status(503).json(reason);
        });
    }
]);

/**
 *  rest: /functions/:projectId/switch/:mode?force= -X POST
 *  mode can be 0/1 ( off/on )
 *  headers:  -H'Authorization': token
 *  output: json
 * @private
 */
export const functionsSwitch = bfast.functions().onPostHttpRequest(`${prefix}/switch/:mode`, [
        routerGuard.checkToken,
        routerGuard.checkIsProjectOwner,
        (request, response) => {
            const mode = request.params.mode;
            if (mode.toString() === '0') {
                functions.faasOff(request.params.projectId, request.query.force === 'true').then(value => {
                    response.status(200).json({message: 'faas engine switched off'});
                }).catch(reason => {
                    response.status(503).json(reason);
                });
            } else if (mode.toString() === '1') {
                functions.faasOn(request.params.projectId, request.query.force === 'true').then(value => {
                    response.status(200).json({message: 'faas engine switch on'});
                }).catch(reason => {
                    response.status(503).json(reason);
                });
            } else {
                response.status(400).json({message: 'Action not known'});
            }
        }
    ]
);

