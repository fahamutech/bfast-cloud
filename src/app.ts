import {RestAdapter} from "./adapters/rest";
import {BFastRouter} from "./router";

export class BFastCloud {
    constructor(private readonly restApi: RestAdapter,
                private readonly options: {
                    port: string
                }) {
        new BFastRouter(this.restApi);
    }

    /**
     * Normalize a port into a number, string, or false.
     */

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

    /**
     * Event listener for HTTP server "error" event.
     */

    private onError(error: any) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        let bind = 'Pipe ' + this.options.port;

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

    /**
     * Event listener for HTTP server "listening" event.
     */

    private static onListening(server: any) {
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        let debug = require('debug')('bfast-ee:server');
        debug.enabled = true;
        debug.useColors = true;
        // console.log(debug);
        debug('Listening on ' + bind);
    }

    startServer(expressApp: any, httpServer: any) {
        const server = httpServer.createServer(expressApp);
        server.listen(BFastCloud.normalizePort(this.options.port));
        server.on('error', this.onError);
        server.on('listening', () => {
            BFastCloud.onListening(server);
        });
    }
}
