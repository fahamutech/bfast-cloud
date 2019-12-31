import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapters/rest";
import {Options} from "../config/Options";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {FunctionsController} from "../controller/FunctionsController";

export class FunctionsRouter implements RestRouterAdapter {
    prefix: string = '/functions';

    private readonly routerGuard: RouterGuardAdapter;
    private readonly functions: FunctionsController;

    constructor(private readonly options: Options) {
        this.routerGuard = this.options.routerGuard ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
        this.functions = new FunctionsController(this.options);
    }

    getRoutes(): RestRouterModel[] {
        return [
            this._deployFunctions(),
            this._addEnvironment(),
            this._removeEnvironment()
        ]
    }

    private _removeEnvironment(): RestRouterModel {
        return {
            name: 'removeEnvironment',
            method: RestRouterMethod.DELETE,
            path: '/:projectId/env',
            onRequest: [
                this.routerGuard.checkToken,
                this.routerGuard.checkIsProjectOwner,
                (request, response) => {
                    const body = request.body;
                    const valid = (body && body.envs && Array.isArray(body.envs) && body.envs.length > 0);
                    if (valid) {
                        this.functions
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

    private _addEnvironment(): RestRouterModel {
        return {
            name: 'addEnvironment',
            method: RestRouterMethod.POST,
            path: '/:projectId/env',
            onRequest: [
                this.routerGuard.checkToken,
                this.routerGuard.checkIsProjectOwner,
                (request, response) => {
                    this.functions
                        .envAdd(request.params.projectId, request.body.envs, request.query.force).then(value => {
                        response.status(200).json({message: 'envs updated'});
                    }).catch(reason => {
                        response.status(503).json({message: 'fails to add envs', reason: reason.toString()});
                    });
                }
            ]
        };
    }

    private _deployFunctions(): RestRouterModel {
        return {
            name: 'deployFunctions',
            method: RestRouterMethod.POST,
            path: '/:projectId',
            onRequest: [
                this.routerGuard.checkToken,
                this.routerGuard.checkIsProjectOwner,
                (request, response) => {
                    this.functions.deploy(request.params.projectId, request.query.force).then(value => {
                        response.status(200).json({message: 'functions deployed'});
                    }).catch(reason => {
                        response.status(503).json({message: 'fails to deploy', reason: reason.toString()});
                    });
                }
            ]
        };
    }

}
