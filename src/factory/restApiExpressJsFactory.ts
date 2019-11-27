import {RestAdapter, RestRouteMethod} from "../adapters/rest";
import {Express, NextFunction, Request, Response} from "express";

export class RestApiExpressJsFactory implements RestAdapter {

    constructor(private readonly app: Express,
                private readonly express: any) {
        this.app._id = 'joshua';
        this.initiateExpressApp();
    }

    private initiateExpressApp() {
        this.app.use(require('morgan')('dev'));
        // @ts-ignore
        this.app.use(this.express.json());
        // @ts-ignore
        this.app.use(this.express.urlencoded({extended: false}));
        this.app.use(require('cookie-parser'));
        // @ts-ignore
        this.app.use(this.express.static(`${__dirname}/../public`));
        // BFastControllers.database;
    }

    mount(routerPrefix: string, route: {
              method: string;
              path: string;
              onRequest: { (request: Request, response: Response, next: NextFunction): void }[]
          }
    ): any {
        console.log(routerPrefix);
        console.log(route);
        console.log(this.app._id);
        switch (route.method) {
            case RestRouteMethod.GET:
                this.app.get(`${routerPrefix}${route.path}`, route.onRequest);
                console.log(this.app.get(`${routerPrefix}${route.path}`, route.onRequest));
                break;
            case RestRouteMethod.POST:
                this.app.post(`${routerPrefix}${route.path}`, route.onRequest);
                break;
            case RestRouteMethod.DELETE:
                this.app.delete(`${routerPrefix}${route.path}`, route.onRequest);
                break;
        }
    }

}
