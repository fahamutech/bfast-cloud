const assert = require('assert');
const MongoMockReplicaSet = require('mongodb-memory-server-core').MongoMemoryReplSet;
const MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;
let mongoReplica;
let mongoServer;

describe("Intergration test for project", function () {

    before(async () => {
        mongoServer = new MongoMemoryServer({
            autoStart: true,
        });
        const res = await mongoServer.getConnectionString();
        process.env.debug = true;
        process.env.mdbhost = res;
    });

    after(async () => {
        await mongoServer.stop();
    });

    it('should accept a simple test', function () {
        console.log(process.env.mdbhost);
        console.log(process.env.debug);
        assert(true);
    });
    
});
