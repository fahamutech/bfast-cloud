const {getEnv} = require('bfast-database-core');
const mongodb = require('mongodb');

const mongoMemoryReplSet = () => {
    return {
        getUri: function () {
            return 'mongodb://localhost/_test';
        },
        start: async function () {
            const conn = await mongodb.MongoClient.connect(this.getUri());
            await conn.db('_test').dropDatabase();
        },
        waitUntilRunning: async function () {
            const conn = await mongodb.MongoClient.connect(this.getUri());
            await conn.db('_test').dropDatabase();
        },
        stop: async function () {
        }
    }
}

exports.serverUrl = 'http://localhost:3111';
exports.mongoRepSet = mongoMemoryReplSet;
exports.config = {
    useLocalIpfs: true,
    applicationId: 'bfast',
    projectId: 'bfast',
    port: '3111',
    logs: false,
    web3Token: new getEnv(process.env['WEB_3_TOKEN']),
    adapters: {
        s3Storage: undefined
    },
    masterKey: 'bfast_test',
    taarifaToken: undefined,
    mongoDbUri: 'mongodb://localhost/_test',
    rsaKeyPairInJson: {},
    rsaPublicKeyInJson: {}
}
