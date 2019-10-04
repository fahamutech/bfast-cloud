const assert = require('assert');
const MongoMockReplicaSet = require('mongodb-memory-server-core').MongoMemoryReplSet;
const MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;
let mongoReplica;
let mongoServer;

describe("Project", function () {

    before(async () => {
        mongoServer = new MongoMemoryServer();
        const res = await mongoServer.getConnectionString();
        console.log(res);
    });

    after(async () => {
        await mongoServer.stop();
    });

    it('should accept a simple test', function () {
        assert(true)
    });
});
