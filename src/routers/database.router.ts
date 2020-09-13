import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {DatabaseController} from "../controllers/database.controller";
import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapters/rest.adapter";
import {BfastConfig} from "../configs/bfast.config";

let routerGuard: RouterGuardAdapter;
let database: DatabaseController;

export class DatabaseRouter implements RestRouterAdapter {
    prefix: string = '/database';

    constructor(private  options: BfastConfig) {
        routerGuard = this.options.routerGuard ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
        database = new DatabaseController(this.options);
    }

    getRoutes(): RestRouterModel[] {
        return [
            this.updateImage(),
            this._addEnvironment(),
            this._removeEnvironment(),
        ];
    }

    /**
     *  rest: /database/:projectId/image?force= -X POST
     *  headers:  -H'Authorization': token
     *  body: {image: string}
     *  output: json
     * @private
     */
    private updateImage(): RestRouterModel {
        return {
            name: 'updateImage',
            method: RestRouterMethod.POST,
            path: '/:projectId/image',
            onRequest: [
                routerGuard.checkToken,
                routerGuard.checkIsProjectOwner,
                routerGuard.checkPayment,
                (request, response) => {
                    database.updateImage(
                        request.params.projectId, request.body.image,
                        request.query.force === 'true'
                    ).then(value => {
                        response.status(200).send(value);
                    }).catch(reason => {
                        response.status(503).json(reason);
                    });
                }
            ]
        }
    }

    /**
     *  rest: /database/:projectId/env?force= -X DELETE
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
                        database
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
        };
    }

    /**
     *  rest: /database/:projectId/env?force= -X POST
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
                    database
                        .envAdd(request.params.projectId, request.body.envs, request.query.force === 'true').then(value => {
                        response.status(200).json({message: 'envs updated'});
                    }).catch(reason => {
                        response.status(503).json({message: 'fails to add envs', reason: reason.toString()});
                    });
                }
            ]
        };
    }
}
