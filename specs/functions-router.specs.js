const assert = require('assert');
const axios = require('axios');
const BfastCloud = require('../lib/bfast-cloud').BfastCloud;
const OptionsMock = require('./config/optionsMock').OptionsMock;
const _MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;
let _mongoServer;
let _bfastCloud;
const hostname = 'http://127.0.0.1:64647';

describe('Functions Rest API', function () {
    before(async () => {
        _mongoServer = new _MongoMemoryServer({
            autoStart: true,
        });
        const mongoUrl = await _mongoServer.getConnectionString();
        process.env.DEBUG = true;
        process.env.MONGO_URL = mongoUrl;
        _bfastCloud = new BfastCloud(new OptionsMock().getOptions(mongoUrl));
    });
    after(async () => {
        await _mongoServer.stop();
        _bfastCloud.stop();
    });

    describe('Custom Domain', function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: 'Joshua',
                    email: 'josh1234@gmail.com',
                    phoneNumber: '0765456638',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                token = response.data.token;
                const project = {
                    name: 'DemoDaas',
                    projectId: 'demo',
                    description: 'short description',
                    isParse: true,
                    parse: {appId: 'demo', masterKey: 'demo'},
                };
                await axios.post(hostname + '/projects/bfast', project, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'content-type': 'application/json'
                    }
                });
                assert(response.status === 200);
            } catch (reason) {
                throw reason.response.data;
            }
        });
        after(async function () {
            try {
                const response = await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                assert(response.status === 200);
            } catch (reason) {
                throw reason.response.data;
            }
        });
        it('should add custom domain', async function () {
            try {
                const response = await axios.post(hostname + '/functions/demo/domain', {
                    domain: "example.com"
                }, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'content-type': 'application/json'
                    }
                });
                console.log(response.data);
                assert(response.status === 200);
            } catch (e) {
                if (e.response) {
                    console.log(e.response.data);
                    throw e.response.data;
                } else {
                    throw e;
                }
            }
        });
    });
});
