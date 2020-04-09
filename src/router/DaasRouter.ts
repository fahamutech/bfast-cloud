import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapter/rest";
import {Options} from "../config/Options";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {DaasController} from "../controller/DaasController";

let routerGuard: RouterGuardAdapter;
let database: DaasController;

export class DaasRouter implements RestRouterAdapter {
    prefix = '/database';

    constructor(private  options: Options) {
        routerGuard = this.options.routerGuard ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
        database = new DaasController(this.options);
    }

    getRoutes(): RestRouterModel[] {
        return [
            this._updateLiveQueryClasses()
        ];
    }

    /**
     *  rest: /database/:projectId/liveQuery?force= -X POST
     *  headers:  -H'Authorization': token
     *  body: {classNames: string[]}
     *  output: json
     * @private
     */
    private _updateLiveQueryClasses(): RestRouterModel {
        return {
            name: 'classLiveQuery',
            method: RestRouterMethod.POST,
            path: '/:projectId/liveQuery',
            onRequest: [
                routerGuard.checkToken,
                routerGuard.checkIsProjectOwner,
                (request, response) => {
                    database
                        .classLiveQuery(request.params.projectId, request.body.classNames, request.query.force === 'true').then(value => {
                        response.status(200).json({message: 'table/collections added to live query'});
                    }).catch(reason => {
                        console.log('**************');
                        response.status(503).json(reason);
                    });
                }
            ]
        };
    }
}
