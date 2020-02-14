import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapter/rest";
import {Options} from "../config/Options";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {DashboardController} from "../controller/DashboardController";

let routerGuard: RouterGuardAdapter;
let dashboard: DashboardController;

export class DashboardRouter implements RestRouterAdapter {
    prefix = '/dashboard';

    constructor(private  options: Options) {
        routerGuard = this.options.routerGuard ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
        dashboard = new DashboardController(this.options);
    }

    getRoutes(): RestRouterModel[] {
        return [
            this._switch(),
        ];
    }

    /**
     *  rest: /dashboard/:projectId/switch/:mode?force= -X POST
     *  mode can be 0/1 ( off/on )
     *  input:  -H'Authorization': token
     *  output: json
     * @private
     */
    private _switch(): RestRouterModel {
        return {
            name: 'switch',
            method: RestRouterMethod.POST,
            path: '/:projectId/switch/:mode',
            onRequest: [
                routerGuard.checkToken,
                routerGuard.checkIsProjectOwner,
                (request, response) => {
                    const mode = request.params.mode;
                    if (mode.toString() === '0') {
                        dashboard.dashboardOff(request.params.projectId, request.query.force).then(value => {
                            response.status(200).json({message: 'database dashboard switched off'});
                        }).catch((reason: any) => {
                            response.status(503).json({
                                message: 'fails to switch dashboard off',
                                reason: reason.toString()
                            });
                        });
                    } else if (mode.toString() === '1') {
                        dashboard.dashboardOn(request.params.projectId, request.query.force).then(value => {
                            response.status(200).json({message: 'database dashboard switched on'});
                        }).catch((reason: any) => {
                            response.status(503).json({
                                message: 'fails to switch dashboard on',
                                reason: reason.toString()
                            });
                        });
                    } else {
                        response.status(400).json({message: 'Action not known'});
                    }
                }
            ]
        };
    }
}
