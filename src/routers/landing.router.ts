import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {ResourceFactory} from "../factory/ResourceFactory";
import {ResourcesAdapter} from "../adapters/resources.adapter";
import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapters/rest.adapter";
import {BfastConfig} from "../configs/bfast.config";

let _routerGuard: RouterGuardAdapter;
let _resources: ResourcesAdapter;
let _options: BfastConfig;

export class LandingRouter implements RestRouterAdapter {
    prefix: string = '/';

    constructor(private readonly options: BfastConfig) {
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
