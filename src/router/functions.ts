import {BFastControllers} from "../controller";
import {RestAdapter, RestRouteMethod} from "../adapters/rest";

export class FunctionsRouter {
    private routerPrefix = '/functions';

    constructor(private readonly restApi: RestAdapter) {
        this.deployProject();
        this.addEnvironment();
        this.removeEnvironment();
    }

    private deployProject() {
        this.restApi.mount(this.routerPrefix, {
            method: RestRouteMethod.GET,
            path: '/:projectId/deploy',
            onRequest: [
                (request, response, next) => {
                    BFastControllers.functions.deploy(request.params.projectId, request.query.force).then(value => {
                        response.status(200).json({message: 'functions deployed'});
                    }).catch(reason => {
                        response.status(503).json({message: 'fails to deploy', reason: reason.toString()});
                    });
                }
            ]
        });
    }

    private addEnvironment() {
        this.restApi.mount(this.routerPrefix, {
            method: RestRouteMethod.POST,
            path: '/:projectId/env',
            onRequest: [
                (request, response, next) => {
                    BFastControllers.functions
                        .envAdd(request.params.projectId, request.body.envs, request.query.force).then(value => {
                        response.status(200).json({message: 'envs updated'});
                    }).catch(reason => {
                        response.status(503).json({message: 'fails to add envs', reason: reason.toString()});
                    });
                }
            ]
        })
    }

    private removeEnvironment() {
        this.restApi.mount(this.routerPrefix, {
            method: RestRouteMethod.POST,
            path: '/:projectId/env/delete',
            onRequest: [
                (request, response, next) => {
                    BFastControllers.functions
                        .envRemove(request.params.projectId, request.body.envs, request.query.force).then(value => {
                        response.status(200).json({message: 'envs updated'});
                    }).catch(reason => {
                        response.status(503).json({message: 'fails to remove envs', reason: reason.toString()});
                    });
                }
            ]
        })
    }

}
