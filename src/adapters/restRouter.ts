export interface RestRouterAdapter {
    prefix: string;

    getRoutes(): RouterModel[];
}

export interface RouterModel {
    name: string;
    method: string;
    path: string;
    onRequest: { (request: any, response: any, next: any): void; } [];
}

export class RouterMethod {
    static GET = 'GET';
    static POST = 'POST';
    static DELETE = 'DELETE'
}
