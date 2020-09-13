import * as http from "http";
import {Server} from "http";
import {RestRouterAdapter, RestRouterMethod, RestServerAdapter} from "../adapters/rest.adapter";

let express: any;
let expressApp: any;
let httpServer: Server;

export class ExpressRestFactory implements RestServerAdapter {

    constructor() {
        express = require('express');
        expressApp = express();
        ExpressRestFactory.initiateExpressApp(expressApp);
    }

    private static initiateExpressApp(expressApp: any) {
        expressApp.use(require('morgan')('dev'));
        expressApp.use(express.json());
        expressApp.use(express.urlencoded({extended: false}));
        expressApp.use(require('cookie-parser')());
    }

    mountRoutes(routerAdapters: RestRouterAdapter[]): any {
        routerAdapters.forEach(routerAdapter => {
            const expressRouter = express.Router();
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
            expressApp.use(routerAdapter.prefix, expressRouter);
        });
    }

    startHttpServer(port: string): any {
        httpServer = http.createServer(expressApp);
        httpServer.listen(ExpressRestFactory.normalizePort(port));
        httpServer.on('error', args => {
            ExpressRestFactory.onError(args, port);
        });
        httpServer.on('listening', () => {
            console.log('bfast::cloud start listen at 0.0.0.0 -> ' + port);
        });
    }

    stopHttpServer() {
        if (!httpServer) {
            console.log('You can not stop non exist server');
            return;
        }
        httpServer.close(err => {
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
