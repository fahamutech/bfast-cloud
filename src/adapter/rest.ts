import {NextFunction, Request, Response} from "express";

export interface RestServerAdapter {
    mountRoutes(routes: RestRouterAdapter[]): any;

    startHttpServer(port: string): any;

    stopHttpServer(): any;

    // startHttpsServer(port: string, ssl: {cert: any, privkey: any}): any;
}

export interface RestRouterAdapter {
    prefix: string;

    getRoutes(): RestRouterModel[];
}

export interface RouterGuardAdapter {
    checkIsAdmin(request: Request, response: Response, next: NextFunction): void;

    checkIsProjectOwner(request: Request, response: Response, next: NextFunction): void;

    checkToken(request: Request, response: Response, next: NextFunction): void;
}

export interface RestRouterModel {
    name: string;
    method: string;
    path: string;
    onRequest: { (request: Request, response: Response, next: NextFunction): void; } [];
}

export class RestRouterMethod {
    static GET = 'GET';
    static POST = 'POST';
    static DELETE = 'DELETE';
    static PUT = 'PUT';
    static PATCH = 'PATCH';
}
