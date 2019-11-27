import {RestRouterAdapter} from "./restRouter";

export interface RestAdapter {
    mountRoutes(routes: RestRouterAdapter[]): any;

    startHttpServer(port: string): any;
}
