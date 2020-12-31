// #!/usr/bin/env node
//
// import {BfastCloud} from "./bfast-cloud.mjs";
//
// new BfastCloud({
//     devMode: process.env.DEBUG === 'true',
//     port: process.env.PORT ? process.env.PORT : '3000',
//     masterKey: process.env.MASTER_KEY ? process.env.MASTER_KEY : 'qwertyuyttrwet7dfkgfger8966553333wt68746',
//     redisHOST: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'rdb',
//     mongoURL: process.env.MONGO_URL ? process.env.MONGO_URL : 'mongodb://localhost/_BFAST_ADMIN',
//     dockerSocket: process.env.DOCKER_SOCKET ? process.env.DOCKER_SOCKET : '/usr/local/bin/docker'
// });

import {OptionsConfig} from "./configs/options.config.mjs";
import {NodeShellFactory} from "./factories/node-shell.factory.mjs";
import {SwarmOrchestrationFactory} from "./factories/swarm-orchestration.factory.mjs";

export class Options extends OptionsConfig {
    devMode = process.env.DEBUG === 'true';
    port = process.env.PORT ? process.env.PORT : '3000';
    masterKey = process.env.MASTER_KEY ? process.env.MASTER_KEY : 'qwertyuyttrwet7dfkgfger8966553333wt68746';
    redisHOST = process.env.REDIS_HOST ? process.env.REDIS_HOST : 'redis://localhost:6379/';
    mongoURL = process.env.MONGO_URL ? process.env.MONGO_URL : 'mongodb://localhost/_BFAST_ADMIN';
    dockerSocket = process.env.DOCKER_SOCKET ? process.env.DOCKER_SOCKET : '/usr/local/bin/docker';

    shellAdapter() {
        return new NodeShellFactory();
    }

    containerOrchAdapter() {
        return new SwarmOrchestrationFactory(this.shellAdapter(),this);
    }
}
