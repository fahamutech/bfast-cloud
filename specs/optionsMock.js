const DockerMock = require('./containerOrchMock').DockerMock;
const NodeShell = require('./shellMock').NodeShell;

module.exports.OptionsMock = class {
    constructor() {
    }

    getOptions(mongoUrl) {
        return {
            devMode: true,
            port: '64647',
            // redisURL: process.env.REDIS_URL
            //     || 'redis://rdb',
            // mongoURL: process.env.MONGO_URL
            //     || 'mongodb://mdb:27017,mdbrs1:27017,mdbrs2:27017/_BFAST_ADMIN?replicaSet=bfastRS',
            mongoURL: mongoUrl,
            containerOrchAdapter: new DockerMock(),
            shellAdapter: new NodeShell(),
            dockerSocket: ''
        }
    }
};
