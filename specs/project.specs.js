const assert = require('assert');
const axios = require('axios');
const BfastCloud = require('../lib/bfast-cloud').BfastCloud;
const OptionsMock = require('./config/optionsMock').OptionsMock;
const _MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;
let _mongoServer;
let _bfastCloud;
const hostname = 'http://127.0.0.1:64647';

describe("Integration test for project", function () {
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

    describe('Create project', function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: 'Joshua',
                    email: 'josh@gmail.com',
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

        it('should create a project of type ssm with valid token and project data', async function () {
            try {
                const project = {
                    name: 'Lbpharmacy',
                    projectId: 'lb1234',
                    description: 'short description',
                    isParse: true,
                    parse: {appId: 'lb123456', masterKey: 'lbmasterkey'},
                    // user: UserModel;
                };
                const response = await axios.post(hostname + '/projects/ssm', project, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                console.log(response.data);
            } catch (reason) {
                throw reason.response.data;
            }
        });
    });

});
