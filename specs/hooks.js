const {config} = require('./test.config');
const {BfastFunctions} = require('bfast-function');
const {join} = require('path');

const bfastFs = new BfastFunctions({
    port: config.port,
    functionsConfig: {
        functionsDirPath: join(__dirname, '/../functions/'),
        bfastJsonPath: __dirname + '/bfast.json'
    }
});

exports.mochaHooks = {
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
        await bfastFs.start().catch(console.log);
    },
    async afterAll() {
        console.log('________END__________');
    }
};
