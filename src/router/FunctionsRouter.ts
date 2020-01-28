import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapter/rest";
import {Options} from "../config/Options";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {FunctionsController} from "../controller/FunctionsController";

let routerGuard: RouterGuardAdapter;
let functions: FunctionsController;

export class FunctionsRouter implements RestRouterAdapter {
    prefix: string = '/functions';

    constructor(private  options: Options) {
        routerGuard = this.options.routerGuard ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
        functions = new FunctionsController(this.options);
    }

    getRoutes(): RestRouterModel[] {
        return [
            this._deployFunctions(),
            this._addEnvironment(),
            this._removeEnvironment()
        ]
    }

    /**
     *  rest: /functions/:projectId/env?force= -X DELETE
     *  input:  -H'Authorization': token
     *  output: json
     * @private
     */
    private _removeEnvironment(): RestRouterModel {
        return {
            name: 'removeEnvironment',
            method: RestRouterMethod.DELETE,
            path: '/:projectId/env',
            onRequest: [
                routerGuard.checkToken,
                routerGuard.checkIsProjectOwner,
                (request, response) => {
                    const body = request.body;
                    const valid = (body && body.envs && Array.isArray(body.envs) && body.envs.length > 0);
                    if (valid) {
                        functions
                            .envRemove(request.params.projectId, request.body.envs, request.query.force).then(value => {
                            response.status(200).json({message: 'envs updated'});
                        }).catch(reason => {
                            response.status(503).json({message: 'fails to remove envs', reason: reason.toString()});
                        });
                    } else {
                        response.status(400).json({message: 'Nothing to update'})
                    }
                }
            ]
        };
    }

    /**
     *  rest: /functions/:projectId/env?force= -X POST
     *  input:  -H'Authorization': token, --data json
     *  output: json
     * @private
     */
    private _addEnvironment(): RestRouterModel {
        return {
            name: 'addEnvironment',
            method: RestRouterMethod.POST,
            path: '/:projectId/env',
            onRequest: [
                routerGuard.checkToken,
                routerGuard.checkIsProjectOwner,
                (request, response) => {
                    functions
                        .envAdd(request.params.projectId, request.body.envs, request.query.force).then(value => {
                        response.status(200).json({message: 'envs updated'});
                    }).catch(reason => {
                        response.status(503).json({message: 'fails to add envs', reason: reason.toString()});
                    });
                }
            ]
        };
    }

    /**
     *  rest: /functions/:projectId?force= -X POST
     *  input:  -H'Authorization': token
     *  output: json
     * @private
     */
    private _deployFunctions(): RestRouterModel {
        return {
            name: 'deployFunctions',
            method: RestRouterMethod.POST,
            path: '/:projectId',
            onRequest: [
                routerGuard.checkToken,
                routerGuard.checkIsProjectOwner,
                (request, response) => {
                    functions.deploy(request.params.projectId, request.query.force).then(value => {
                        response.status(200).json({message: 'functions deployed'});
                    }).catch(reason => {
                        response.status(503).json(reason);
                    });
                }
            ]
        };
    }

}
