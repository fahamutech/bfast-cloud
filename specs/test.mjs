import {getEnv} from "bfast-database-core";
import mongodb from "mongodb";

const mongoMemoryReplSet = () => {
    return {
        getUri: function () {
            return 'mongodb://localhost/bfast';
        },
        start: async function () {
            const conn = await mongodb.MongoClient.connect(this.getUri());
            await conn.db('bfast').dropDatabase();
        },
        waitUntilRunning: async function () {
            const conn = await mongodb.MongoClient.connect(this.getUri());
            await conn.db('bfast').dropDatabase();
        },
        stop: async function () {
        }
    }
}

export const serverUrl = 'http://localhost:3111';
export const mongoRepSet = mongoMemoryReplSet;
export const config = {
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
    databaseURI: 'mongodb://localhost/_test',
    rsaKeyPairInJson: {},
    rsaPublicKeyInJson: {}
}
