import {RestRouterAdapter, RestRouterMethod, RestServerAdapter} from "../adapter/rest";
import * as http from "http";
import {Server} from "http";

export class ExpressRestFactory implements RestServerAdapter {
    private readonly express: any;
    private readonly expressApp: any;
    // @ts-ignore
    private httpServer: Server;

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
    }

    mountRoutes(routerAdapters: RestRouterAdapter[]): any {
        routerAdapters.forEach(routerAdapter => {
            const expressRouter = this.express.Router();
            routerAdapter.getRoutes().forEach(router => {
                switch (router.method) {
                    case RestRouterMethod.GET:
                        expressRouter.get(router.path, router.onRequest);
                        break;
                    case RestRouterMethod.POST:
                        expressRouter.post(router.path, router.onRequest);
                        break;
                    case RestRouterMethod.DELETE:
                        expressRouter.delete(router.path, router.onRequest);
                        break;
                    case RestRouterMethod.PATCH:
                        expressRouter.patch(router.path, router.onRequest);
                        break;
                }
            });
            this.expressApp.use(routerAdapter.prefix, expressRouter);
        });
    }

    startHttpServer(port: string): any {
        this.httpServer = http.createServer(this.expressApp);
        this.httpServer.listen(ExpressRestFactory.normalizePort(port));
        this.httpServer.on('error', args => {
            ExpressRestFactory.onError(args, port);
        });
        this.httpServer.on('listening', () => {
            console.log('bfast::cloud start listen at 0.0.0.0 -> ' + port);
        });
    }

    stopHttpServer() {
        if (!this.httpServer) {
            console.log('You can not stop non exist server');
            return;
        }
        this.httpServer.close(err => {
            if (err) {
                console.error(err);
            } else {
                console.log('bfast::cloud stop listen');
            }
        })
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
