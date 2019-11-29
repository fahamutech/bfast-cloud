import {RestAdapter} from "../adapters/rest";
import {RestRouterAdapter, RouterMethod} from "../adapters/restRouter";
import * as http from "http";

export class RestApiFactory implements RestAdapter {
    private readonly express: any;
    private readonly expressApp: any;

    constructor() {
        this.express = require('express');
        this.expressApp = this.express();
        this.initiateExpressApp(this.expressApp);
    }

    private initiateExpressApp(expressApp: any) {
        expressApp.use(require('morgan')('dev'));
        expressApp.use(this.express.json());
        expressApp.use(this.express.urlencoded({extended: false}));
        expressApp.use(require('cookie-parser')());
        expressApp.use(this.express.static(`${__dirname}/../public`));
        // BFastControllers.database;
    }

    mountRoutes(routerAdapters: RestRouterAdapter[]): any {
        routerAdapters.forEach(routerAdapter => {
            // console.log(routerAdapter);
            const expressRouter = this.express.Router();
            routerAdapter.getRoutes().forEach(router => {
                // console.log(router);
                switch (router.method) {
                    case RouterMethod.GET:
                        expressRouter.get(router.path, router.onRequest);
                        break;
                    case RouterMethod.POST:
                        expressRouter.post(router.path, router.onRequest);
                        break;
                    case RouterMethod.DELETE:
                        expressRouter.delete(router.path, router.onRequest);
                        break;
                    case RouterMethod.PATCH:
                        expressRouter.patch(router.path, router.onRequest);
                        break;
                }
            });
            this.expressApp.use(routerAdapter.prefix, expressRouter);
        });
    }

    startHttpServer(port: string): any {
        const server = http.createServer(this.expressApp);
        server.listen(RestApiFactory.normalizePort(port));
        server.on('error', args => {
            RestApiFactory.onError(args, port);
        });
        server.on('listening', () => {
            console.log('BFast::Cloud listen at 0.0.0.0 -> ' + port);
        });
    }

    private static normalizePort(val: string) {
        let port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    private static onError(error: any, port: string) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        let bind = 'Pipe ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

}
