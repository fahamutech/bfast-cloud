const assert = require('assert');
const axios = require('axios');
const BfastCloud = require('../lib/bfast-cloud').BfastCloud;
const OptionsMock = require('./config/optionsMock').OptionsMock;
const _MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;
let _mongoServer;
let _bfastCloud;
const hostname = 'http://127.0.0.1:64647';

describe('DaaS and Dashboard Rest API', function () {
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

    describe('Realtime classes updates test', function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: 'Joshua',
                    email: 'josh123@gmail.com',
                    phoneNumber: '0765456638',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                token = response.data.token;
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
        it('should update realtime engine with new collections', async function () {
            try {
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
                const response = await axios.post(hostname + '/database/demo/liveQuery', {
                    classNames: ['sales', 'stocks']
                }, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'content-type': 'application/json'
                    }
                });
                assert(response.status === 200);
                assert(response.data.message === 'table/collections added to live query');
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
