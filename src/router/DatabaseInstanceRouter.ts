import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapter/rest";
import {BFastOptions} from "../config/BFastOptions";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {DatabaseInstanceController} from "../controller/DatabaseInstanceController";

let routerGuard: RouterGuardAdapter;
let database: DatabaseInstanceController;

export class DatabaseInstanceRouter implements RestRouterAdapter {
    prefix = '/database';

    constructor(private  options: BFastOptions) {
        routerGuard = this.options.routerGuard ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
        database = new DatabaseInstanceController(this.options);
    }

    getRoutes(): RestRouterModel[] {
        return [
            this.updateImage()
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
                        response.status(200).json({message: value});
                    }).catch(reason => {
                        response.status(503).json(reason);
                    });
                }
            ]
        }
    }
}
