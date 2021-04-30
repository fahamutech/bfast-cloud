import {OptionsConfig} from "./configs/options.config.mjs";
import {NodeShellFactory} from "./factories/node-shell.factory.mjs";
import {SwarmOrchestrationFactory} from "./factories/swarm-orchestration.factory.mjs";
import {EnvUtil} from "bfast-database-core";

export class Options extends OptionsConfig {
    devMode = process.env.DEBUG === 'true';
    port = process.env.PORT ? process.env.PORT : '3000';
    projectId = process.env.PROJECT_ID ? process.env.PROJECT_ID : 'bfast';
    applicationId = process.env.APPLICATION_ID ? process.env.APPLICATION_ID : 'bfast';
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

export function getBFastDatabaseConfigs() {
    const envUtil = new EnvUtil();
    const options = new Options();
    let isS3Configured = true;
    const s3Bucket = envUtil.getEnv(process.env.S3_BUCKET);
    const s3AccessKey = envUtil.getEnv(process.env.S3_ACCESS_KEY);
    const s3SecretKey = envUtil.getEnv(process.env.S3_SECRET_KEY);
    const s3Endpoint = envUtil.getEnv(process.env.S3_ENDPOINT);
    const s3Region = envUtil.getEnv(process.env.S3_REGION);

    let checker = [];
    checker.push(s3Bucket, s3AccessKey, s3SecretKey, s3Endpoint, s3Region);
    checker = checker.filter(x => {
        if (!x) {
            return false;
        } else if (x.toString() === 'null') {
            return false;
        } else if (x.toString() === 'undefined') {
            return false;
        } else return x.toString() !== '';
    })
    if (checker.length === 0) {
        isS3Configured = false;
    } else {
        checker.forEach(value => {
            if (!value) {
                isS3Configured = false;
            } else if (value.toString() === 'null') {
                isS3Configured = false;
            } else if (value.toString() === 'undefined') {
                isS3Configured = false;
            } else if (value.toString() === '') {
                isS3Configured = false;
            }
        })
    }
    const port = options.port
    return {
        applicationId: options.applicationId,
        projectId: options.projectId,
        masterKey: options.masterKey,
        logs: envUtil.getEnv(process.env.LOGS) === '1',
        port: port ? port : '3000',
        taarifaToken: envUtil.getEnv(process.env.TAARIFA_TOKEN),
        rsaKeyPairInJson: envUtil.getEnv(process.env.RSA_PRIV),
        rsaPublicKeyInJson: envUtil.getEnv(process.env.RSA_PUB),
        mongoDbUri: options.mongoURL,
        adapters: {
            s3Storage: isS3Configured ? {
                bucket: s3Bucket,
                endPoint: s3Endpoint,
                secretKey: s3SecretKey,
                accessKey: s3AccessKey,
                region: s3Region
            } : undefined,
        }
    }
}
