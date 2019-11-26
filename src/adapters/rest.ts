export interface RestAdapter {
    mount(route: {
        method: string,
        path: string,
        onRequest: { (request: any, response: any, next: any): void; } []
    }): any;
}

export class RestRouteMethod {
    static GET = 'GET';
    static POST = 'POST';
    static DELETE = 'DELETE'
}
