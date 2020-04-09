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
        //  process.exit(0);
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
                };
                const response = await axios.post(hostname + '/projects/ssm', project, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                assert(response.status === 200);
                assert(response.data.name === 'Lbpharmacy');
                assert(response.data.projectId === 'lb1234');
                assert(response.data.description === 'short description');
                assert(response.data.parse.appId === 'lb123456');
                assert(response.data.parse.masterKey === undefined);
                assert(response.data.user);
                assert(response.data.user.displayName === 'Joshua');
                assert(response.data.user.email === 'josh@gmail.com');
                assert(response.data.type === 'ssm');
                assert(response.data.members.length === 0);
                assert(response.data.id);
            } catch (reason) {
                throw reason.response.data;
            }
        });
        it('should not create a project of type ssm with invalid token and valid project data', async function () {
            try {
                const project = {
                    name: 'Lbpharmacy',
                    projectId: 'pharmacy',
                    description: 'short description',
                    isParse: true,
                    parse: {appId: 'lb123456', masterKey: 'lbmasterkey'},
                    // user: UserModel;
                };
                await axios.post(hostname + '/projects/ssm', project, {
                    headers: {
                        'Authorization': 'Bearer ' + token + 'uuy'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Fails to verify token');
                assert(response.data.reason === 'JsonWebTokenError: invalid signature');
            }
        });
        it('should not create a project of type ssm with no token and valid project data', async function () {
            try {
                const project = {
                    name: 'Lbpharmacy1',
                    projectId: 'pharmacy1',
                    description: 'short description',
                    isParse: true,
                    parse: {appId: 'lb123456', masterKey: 'lbmasterkey'},
                    // user: UserModel;
                };
                await axios.post(hostname + '/projects/ssm', project, {
                    headers: {
                        'Authorization': 'Bearer '
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Fails to verify token');
                assert(response.data.reason === 'JsonWebTokenError: jwt must be provided');
            }
        });
        it('should not create a project of type ssm with no authorization header and valid project data', async function () {
            try {
                const project = {
                    name: 'Lbpharmacy3',
                    projectId: 'pharmacy2',
                    description: 'short description',
                    isParse: true,
                    parse: {appId: 'lb123456', masterKey: 'lbmasterkey'},
                    // user: UserModel;
                };
                await axios.post(hostname + '/projects/ssm', project);
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Identify yourself');
            }
        });
        it('should not create a project of type ssm with no authorization header and invalid project data', async function () {
            try {
                const project = {
                    name: 'Lbpharmacy3',
                    // projectId: 'pharmacy2',
                    // description: 'short description',
                    // isParse: true,
                    // parse: {appId: 'lb123456', masterKey: 'lbmasterkey'},
                    // user: UserModel;
                };
                await axios.post(hostname + '/projects/ssm', project);
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Identify yourself');
            }
        });
        it('should not create a project of type ssm with token and invalid project data', async function () {
            try {
                const project = {
                    name: 'Lbpharmacy6',
                    projectId: 'pharmacy8',
                    // description: 'short description',
                    // isParse: true,
                    // parse: {appId: 'lb123456', masterKey: 'lbmasterkey'},
                };
                await axios.post(hostname + '/projects/ssm', project, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
            } catch (reason) {
                const response = reason.response;
                console.log(response.data);
                assert(response.status === 400);
                assert(response.data.message === 'Invalid project data');
            }
        });
        it('should create a project of type bfast with valid token and project data', async function () {
            try {
                const project = {
                    name: 'Stock',
                    projectId: 'stock',
                    description: 'short description',
                    isParse: true,
                    parse: {appId: 'stock', masterKey: 'stockmaster'},
                    // user: UserModel;
                };
                const response = await axios.post(hostname + '/projects/bfast', project, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                assert(response.status === 200);
                assert(response.data.name === 'Stock');
                assert(response.data.projectId === 'stock');
                assert(response.data.description === 'short description');
                assert(response.data.parse.appId === 'stock');
                assert(response.data.parse.masterKey === undefined);
                assert(response.data.user);
                assert(response.data.user.displayName === 'Joshua');
                assert(response.data.user.email === 'josh@gmail.com');
                assert(response.data.type === 'bfast');
                assert(response.data.members.length === 0);
                assert(response.data.id);
            } catch (reason) {
                throw reason.response.data;
            }
        });
    });

    describe('Get Projects', function () {

        let token = '';
        let tokenMember = '';
        before(async function () {
            try {
                const user = {
                    displayName: 'Joshua',
                    email: 'josh2257@gmail.com',
                    phoneNumber: '0765456638',
                    role: 'ADMIN',
                    password: 'joshua'
                };
                const memberUser = {
                    displayName: 'jj',
                    email: 'j2@gmail.com',
                    phoneNumber: '0765456638',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                const responseMember = await axios.post(hostname + '/users/', memberUser);
                token = response.data.token;
                tokenMember = responseMember.data.token;
                assert(response.status === 200);
                assert(responseMember.status === 200);
            } catch (reason) {
                throw reason.toString();
            }
        });
        after(async function () {
            try {
                const response = await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                const responseMember = await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + tokenMember
                    }
                });
                assert(response.status === 200);
                assert(responseMember.status === 200);
            } catch (reason) {
                throw reason.response.data;
            }
        });

        describe('Invited project', function () {
            before(async function () {
                try {
                    const project = {
                        name: 'testInv',
                        projectId: 'lb10989234',
                        description: 'short description',
                        isParse: true,
                        parse: {appId: 'lb123werfdd456', masterKey: 'lbm900oujsterkey'},
                    };
                    const response = await axios.post(hostname + '/projects/bfast', project, {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    await axios.post(`${hostname}/projects/${response.data.projectId}/members`, {
                        email: "j2@gmail.com",
                        displayName: "Joshua"
                    }, {
                        headers: {
                            'authorization': 'Bearer ' + token
                        }
                    })
                    assert(response.status === 200);
                } catch (e) {
                    console.log(e.response);
                    throw e;
                }
            });
            it('should get project by member', async function () {
                try {
                    const response = await axios.get(`${hostname}/projects`, {
                        headers: {
                            'authorization': 'Bearer ' + tokenMember
                        }
                    });
                    assert(response.status === 200);
                    assert(response.data.length === 1);
                    assert(response.data[0].projectId === 'lb10989234');
                } catch (reason) {
                    if (reason.response) {
                        throw reason.response.data;
                    } else {
                        throw reason.toString();
                    }
                }
            });
        });
    });

});
