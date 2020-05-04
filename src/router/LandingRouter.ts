import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapter/rest";
import {BFastOptions} from "../config/BFastOptions";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {ResourcesAdapter} from "../adapter/resources";
import {ResourceFactory} from "../factory/ResourceFactory";

let _routerGuard: RouterGuardAdapter;
let _resources: ResourcesAdapter;
let _options: BFastOptions;

export class LandingRouter implements RestRouterAdapter {
    prefix: string = '/';

    constructor(private readonly options: BFastOptions) {
        _options = this.options;
        _routerGuard = _options.routerGuard ?
            _options.routerGuard : new RouterGuardFactory(_options);
        _resources = _options.resourcesAdapter ?
            _options.resourcesAdapter : new ResourceFactory();
    }

    getRoutes(): RestRouterModel[] {
        return [
            this._landing(),
            this._resetPasswordUi()
        ];
    }

    /**
     *  rest: / -X GET
     *  input: N/A
     *  output: json
     * @private
     */
    private _landing(): RestRouterModel {
        return {
            name: 'getLandingUi',
            method: RestRouterMethod.GET,
            path: '/',
            onRequest: [
                (request, response) => {
                    response.status(200).json({message: 'welcome to secured bfast::cloud'});
                }
            ]
        };
    }

    /**
     *  rest: /ui/password/reset/?token= -X GET
     *  input: N/A
     *  output: HTML
     * @private
     */
    private _resetPasswordUi(): RestRouterModel {
        return {
            name: 'resetPasswordUI',
            method: RestRouterMethod.GET,
            path: '/ui/password/reset/',
            onRequest: [
                _routerGuard.checkToken,
                (request, response) => {
                    const html = _resources.getHTML('reset-password');
                    response.status(200).send(html);
                }
            ]
        };
    }
}
