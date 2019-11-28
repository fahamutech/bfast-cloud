import {RestRouterAdapter, RouterMethod, RouterModel} from "../adapters/restRouter";
import {BFastControllers} from "../controller";

export class FunctionsRouter implements RestRouterAdapter {
    prefix: string = '/functions';

    getRoutes(): RouterModel[] {
        return [
            {
                name: 'deployProject',
                method: RouterMethod.GET,
                path: '/:projectId/deploy',
                onRequest: [
                    (request, response, next) => {
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
                method: RouterMethod.POST,
                path: '/:projectId/env',
                onRequest: [
                    (request, response, next) => {
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
                method: RouterMethod.POST,
                path: '/:projectId/env/delete',
                onRequest: [
                    (request, response, next) => {
                        BFastControllers.functions()
                            .envRemove(request.params.projectId, request.body.envs, request.query.force).then(value => {
                            response.status(200).json({message: 'envs updated'});
                        }).catch(reason => {
                            response.status(503).json({message: 'fails to remove envs', reason: reason.toString()});
                        });
                    }
                ]
            }
        ]
    }

}
