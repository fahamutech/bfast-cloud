const DockerMock = require('./containerOrchMock').DockerMock;
const NodeShell = require('./shellMock').NodeShell;
const EmailMock = require('./emailMock').EmailMock;

module.exports.OptionsMock = class {
    constructor() {
    }

    getOptions(mongoUrl) {
        return {
            devMode: true,
            port: '64647',
            masterKey: 'masterkeytest',
            // mongoURL: process.env.MONGO_URL
            //     || 'mongodb://mdb:27017,mdbrs1:27017,mdbrs2:27017/_BFAST_ADMIN?replicaSet=bfastRS',
            mongoURL: mongoUrl,
            // containerOrchAdapter: new DockerMock(),
            shellAdapter: new NodeShell(),
            emailAdapter: new EmailMock(),
            dockerSocket: '/usr/local/bin/docker'
        }
    }
};
