const assert = require('assert');
const MongoMockReplicaSet = require('mongodb-memory-server-core').MongoMemoryReplSet;
const MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;
let mongoReplica;
let mongoServer;

describe("Integration test for project", function () {

    before(async () => {
        mongoServer = new MongoMemoryServer({
            autoStart: true,
        });
        const mongoUrl = await mongoServer.getConnectionString();
        process.env.DEBUG = true;
        process.env.MONGO_URL = mongoUrl;
    });

    after(async () => {
        await mongoServer.stop();
    });

    it('should accept a simple test', function () {
        console.log(process.env.MONGO_URL);
        console.log(process.env.DEBUG);
        assert(true);
    });

});
