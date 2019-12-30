import {BFastControllers} from "../controller";
import {RolesBasedRestRouter} from "../factory/RolesBasedRestRouter";
import {RestRouterAdapter, RestRouterMethod, RestRouterModel} from "../adapters/rest";

export class FunctionsRouter extends RolesBasedRestRouter implements RestRouterAdapter {
    prefix: string = '/functions';

    getRoutes(): RestRouterModel[] {
        return [
            {
                name: 'deployFunctions',
                method: RestRouterMethod.POST,
                path: '/:projectId',
                onRequest: [
                    this.checkToken,
                    this.checkIsProjectOwner,
                    (request, response) => {
                        BFastControllers.functions().deploy(request.params.projectId, request.query.force).then(value => {
                            response.status(200).json({message: 'functions deployed'});
                        }).catch(reason => {
                            response.status(503).json({message: 'fails to deploy', reason: reason.toString()});
                        });
                    }
                ]
            },
            {
                name: 'addEnvironment',
                method: RestRouterMethod.POST,
                path: '/:projectId/env',
                onRequest: [
                    this.checkToken,
                    this.checkIsProjectOwner,
                    (request, response) => {
                        BFastControllers.functions()
                            .envAdd(request.params.projectId, request.body.envs, request.query.force).then(value => {
                            response.status(200).json({message: 'envs updated'});
                        }).catch(reason => {
                            response.status(503).json({message: 'fails to add envs', reason: reason.toString()});
                        });
                    }
                ]
            },
            {
                name: 'removeEnvironment',
                method: RestRouterMethod.DELETE,
                path: '/:projectId/env',
                onRequest: [
                    this.checkToken,
                    this.checkIsProjectOwner,
                    (request, response) => {
                        const body = request.body;
                        const valid = !!(body && body.envs && Array.isArray(body.envs) && body.envs.length > 0);
                        if (valid) {
                            BFastControllers.functions()
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
            }
        ]
    }

}
