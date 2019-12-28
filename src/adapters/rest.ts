export interface RestAdapter {
    mountRoutes(routes: RestRouterAdapter[]): any;

    startHttpServer(port: string): any;

    // startHttpsServer(port: string, ssl: {cert: any, privkey: any}): any;
}

export interface RestRouterAdapter {
    prefix: string;

    getRoutes(): RestRouterModel[];
}

export interface RestRouterModel {
    name: string;
    method: string;
    path: string;
    onRequest: { (request: any, response: any, next: any): void; } [];
}

export class RestRouterMethod {
    static GET = 'GET';
    static POST = 'POST';
    static DELETE = 'DELETE';
    static PUT = 'PUT';
    static PATCH = 'PATCH';
}
