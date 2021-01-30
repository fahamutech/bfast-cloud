import {OptionsConfig} from "./configs/options.config.mjs";
import {NodeShellFactory} from "./factories/node-shell.factory.mjs";
import {SwarmOrchestrationFactory} from "./factories/swarm-orchestration.factory.mjs";
import bfastnode from "bfastnode";
import {DatabaseConfigFactory} from "./factories/database-config.factory.mjs";

const {bfast} = bfastnode;

export class Options extends OptionsConfig {
    devMode = process.env.DEBUG === 'true';
    port = process.env.PORT ? process.env.PORT : '3000';
    masterKey = process.env.MASTER_KEY ? process.env.MASTER_KEY : 'bfast-cloud';
    redisHOST = process.env.REDIS_HOST ? process.env.REDIS_HOST : 'localhost';
    mongoURL = process.env.MONGO_URL ? process.env.MONGO_URL : 'mongodb://localhost/_BFAST_ADMIN';
    dockerSocket = process.env.DOCKER_SOCKET ? process.env.DOCKER_SOCKET : '/usr/local/bin/docker';

    shellAdapter() {
        return new NodeShellFactory();
    }

    containerOrchAdapter() {
        return new SwarmOrchestrationFactory(this.shellAdapter(), this);
    }
}

bfast.init({
    applicationId: 'fahamutaarifa',
    projectId: 'fahamutaarifa'
}, 'fahamutaarifa');

new DatabaseConfigFactory(new Options().mongoURL).collection('_Project').then(async collection => {
    try {
        const pNameIndex = await collection.indexExists('projectId');
        if (!pNameIndex) {
            await collection.createIndex({projectId: 1}, {unique: true});
        }
    } catch (e) {
        throw e;
    }
}).catch(reason => {
    console.log(reason);
    process.exit(-1);
})
