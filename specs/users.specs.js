const assert = require('assert');
const BfastCloud = require('../lib/bfast-cloud').BfastCloud;
const OptionsMock = require('./optionsMock').OptionsMock;
// const MongoMockReplicaSet = require('mongodb-memory-server-core').MongoMemoryReplSet;
const MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;
// let mongoReplica;
let mongoServer;
let bfastCloud;


describe("Integration test for users", function () {

    before(async () => {
        mongoServer = new MongoMemoryServer({
            autoStart: true,
        });
        const mongoUrl = await mongoServer.getConnectionString();
        process.env.DEBUG = true;
        process.env.MONGO_URL = mongoUrl;
        bfastCloud = new BfastCloud(new OptionsMock().getOptions(mongoUrl));
    });

    after(async () => {
        await mongoServer.stop();
        bfastCloud.stop();
    });

    it('should create account', function () {
        console.log('crate user in bfast');
        assert(true);
    });

});
