import {OptionsConfig} from "./configs/options.config.mjs";
import {NodeShellFactory} from "./factories/node-shell.factory.mjs";
import {SwarmOrchestrationFactory} from "./factories/swarm-orchestration.factory.mjs";
import {loadEnv} from "./env.mjs";

const _config = {
    useLocalIpfs: process.env.USE_LOCAL_IPFS?.toLowerCase()?.trim() === 'true',
    rsaKeyPairInJson: {},
    rsaPublicKeyInJson: {},
}
let myConfig = loadEnv();
export const config = Object.assign(myConfig, _config);

export class Options extends OptionsConfig {
    devMode = process.env.DEBUG === 'true';
    port = process.env.PORT ? process.env.PORT : '3000';
    projectId = process.env.PROJECT_ID ? process.env.PROJECT_ID : 'bfast';
    applicationId = process.env.APPLICATION_ID ? process.env.APPLICATION_ID : 'bfast';
    masterKey = process.env.MASTER_KEY ? process.env.MASTER_KEY : 'bfast-cloud';
    databaseURI = process.env.DATABASE_URI ? process.env.DATABASE_URI : 'mongodb://localhost/_BFAST_ADMIN';
    dockerSocket = process.env.DOCKER_SOCKET ? process.env.DOCKER_SOCKET : '/usr/local/bin/docker';

    shellAdapter() {
        return new NodeShellFactory();
    }

    containerOrchAdapter() {
        return new SwarmOrchestrationFactory(this.shellAdapter(), this);
    }
}
