import {start} from "bfast-function";
import {join} from "path";
import {config} from "./test.mjs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const mochaHooks = {
    async beforeAll() {
        process.env.USE_LOCAL_IPFS = 'true';
        process.env.APPLICATION_ID = config.applicationId;
        process.env.PROJECT_ID = config.projectId;
        process.env.MASTER_KEY = config.masterKey;
        process.env.PORT = config.port.toString();
        process.env.DATABASE_URI = config.databaseURI;
        process.env.TAARIFA_TOKEN = config.taarifaToken;
        process.env.RSA_PUBLIC_KEY = JSON.stringify(config.rsaPublicKeyInJson);
        process.env.RSA_KEY = JSON.stringify(config.rsaKeyPairInJson);
        console.log('________START__________');
        await start({
            port: config.port,
            functionsConfig: {
                functionsDirPath: join(__dirname, '/../functions/'),
                bfastJsonPath: __dirname + '/bfast.json'
            }
        }).catch(console.log);
    },
    async afterAll() {
        console.log('________END__________');
    }
};
