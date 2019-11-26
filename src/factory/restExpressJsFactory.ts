import {RestAdapter, RestRouteMethod} from "../adapters/rest";
import {Express} from "express";

export class RestExpressJsFactory implements RestAdapter {

    constructor(private readonly routerPrefix: string,
                private readonly expressApp: Express) {
    }

    mount(route: { method: string; path: string; onRequest: { (request: any, response: any, next: any): void }[] }): any {
        switch (route.method) {
            case RestRouteMethod.GET:
                this.expressApp.get(`${this.routerPrefix}${route.path}`, route.onRequest);
                break;
            case RestRouteMethod.POST:
                this.expressApp.post(`${this.routerPrefix}${route.path}`, route.onRequest);
                break;
            case RestRouteMethod.DELETE:
                this.expressApp.delete(`${this.routerPrefix}${route.path}`, route.onRequest);
                break;
        }
    }

}
