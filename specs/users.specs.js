const assert = require('assert');
const axios = require('axios');
const BfastCloud = require('../lib/bfast-cloud').BfastCloud;
const OptionsMock = require('./config/optionsMock').OptionsMock;
const MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;
let mongoServer;
let bfastCloud;
const hostname = 'http://127.0.0.1:64647';

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
    describe("User create", function () {
        it('should create account with valid data', async function () {
            try {
                const user = {
                    displayName: "Joshua Mshana",
                    email: 'jos87687a@gmail.com',
                    phoneNumber: '07654564464',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                assert(response.status === 200);
                assert(response.data.role === 'USER');
                assert(response.data.displayName === 'Joshua Mshana');
                assert(response.data.email === 'jos87687a@gmail.com');
                assert(response.data.phoneNumber === '07654564464');
                assert(response.data.password === undefined);
                assert(response.data.token !== undefined && response.data.token !== null);
                assert(response.data.uid !== undefined && response.data.uid !== null);
            } catch (reason) {
                console.error(reason.response.data);
                throw {message: 'Should created account test fails'};
            }
        });
        it('should not create user with invalid data', async function () {
            try {
                const user = {
                    displayName: 'joshua'
                };
                await axios.post(hostname + '/users/', user);
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message ===
                    'invalid data supplied, displayName, phoneNumber, email and password required');
            }
        });
        it('should not create user with no body supplied', async function () {
            try {
                await axios.post(hostname + '/users/');
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message ===
                    'invalid data supplied, displayName, phoneNumber, email and password required');
            }
        });
    });
    describe("User login", function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: "Joshua2",
                    email: 'joshua@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                await axios.post(hostname + '/users/', user);
            } catch (reason) {
                throw reason.response.data;
            }
        });
        after(async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token.trim()
                    }
                });
            } catch (reason) {
                throw reason.response.data;
            }
        });
        it('should login with valid email and password', async function () {
            try {
                const response = await axios.post(hostname + '/users/login', {
                    email: 'joshua@gmail.com',
                    password: 'joshua'
                });
                assert(response.data.displayName === 'Joshua2');
                assert(response.data.email === 'joshua@gmail.com');
                assert(response.data.phoneNumber === '0765456464');
                assert(response.data.role === 'USER');
                assert(response.data.token !== undefined && response.data.token !== null);
                assert(response.data.uid !== undefined && response.data.uid !== null);
                token = response.data.token;
            } catch (e) {
                console.log(e.response.data);
                throw e.response.data;
            }
        });
        it('should not login with inValid email and valid password', async function () {
            try {
                await axios.post(hostname + '/users/login', {
                    email: 'j@.com',
                    password: 'joshua'
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message === 'Fails to login');
                assert(response.data.reason === 'User with that email not exist');
            }
        });
        it('should not login with valid email and inValid password', async function () {
            try {
                await axios.post(hostname + '/users/login', {
                    email: 'joshua@gmail.com',
                    password: 'jos'
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message === 'Fails to login');
                assert(response.data.reason === 'Password/Username is incorrect');
            }
        });
        it('should not login with no email and password supplied', async function () {
            try {
                await axios.post(hostname + '/users/login');
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message === 'invalid data supplied');
            }
        });
        it('should not login with Invalid email and inValid password', async function () {
            try {
                await axios.post(hostname + '/users/login', {
                    email: 'joshuiiiia@gmail.com',
                    password: 'jos99889'
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message === 'Fails to login');
                assert(response.data.reason === 'User with that email not exist');
            }
        });
        it('should not login with email supplied and no password', async function () {
            try {
                await axios.post(hostname + '/users/login', {
                    email: 'joshuiiiia@gmail.com'
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message === 'invalid data supplied');
            }
        });
        it('should not login with no email but password supplied', async function () {
            try {
                await axios.post(hostname + '/users/login', {
                    password: 'joshua'
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message === 'invalid data supplied');
            }
        });
    });
    describe("User logout", function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: "Joshua2",
                    email: 'joshua@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                token = response.data.token;
            } catch (reason) {
                throw reason.response.data;
            }
        });
        // after(async function () {
        //     try {
        //         await axios.delete(hostname + '/users/me', {
        //             headers: {
        //                 'Authorization': 'Bearer ' + token
        //             }
        //         });
        //     } catch (reason) {
        //         throw reason.response.data;
        //     }
        // });
        it('should logout from all device', async function () {
            try {
                const response = await axios.post(hostname + '/users/logout', {
                    token: token
                });
                assert(response.status === 200);
                assert(response.data.message === 'Token revoked');
                await axios.get(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Token revoked');
            }
        });
    });
    describe("User profile", function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: "Joshua",
                    email: 'fahamutech@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                token = response.data.token;
            } catch (reason) {
                console.error(reason.response.data);
                throw {message: 'Fails to create user'};
            }
        });
        after(async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token.trim()
                    }
                });
            } catch (reason) {
                console.error(reason.response.data);
                throw {message: 'Fails to create user'};
            }
        });
        it('should get user details with valid token', async function () {
            try {
                const response = await axios.get(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                assert(response.status === 200);
                assert(response.data.displayName === 'Joshua');
                assert(response.data.email === 'fahamutech@gmail.com');
                assert(response.data.phoneNumber === '0765456464');
                assert(response.data.role === 'USER');
                assert(response.data.uid !== null && response.data.uid !== undefined);
            } catch (reason) {
                ;
                throw reason.response.data;
            }
        });
        it('should not get user details with in-valid token', async function () {
            try {
                await axios.get(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token + '87hjgkjgkj'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Fails to verify token');
                assert(response.data.reason === 'JsonWebTokenError: invalid signature');
            }
        });
        it('should not get user details with malformed token', async function () {
            try {
                await axios.get(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer 87hjgkjgkj89689yuiku'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Fails to verify token');
                assert(response.data.reason === 'JsonWebTokenError: jwt malformed');
            }
        });
        it('should not get user details with no token and authorization header', async function () {
            try {
                await axios.get(hostname + '/users/me');
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Identify yourself');
            }
        });
        it('should not get user details with authorization header but no token', async function () {
            try {
                await axios.get(hostname + '/users/me', {
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
        it('should not get user details with empty authorization header', async function () {
            try {
                await axios.get(hostname + '/users/me', {
                    headers: {
                        'Authorization': ''
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Identify yourself');
            }
        });
    });
    describe('User role', function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: "Ethan",
                    email: 'ethan@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                token = response.data.token;
            } catch (reason) {
                console.error(reason.response.data);
                throw {message: 'Fails to create user'};
            }
        });

        after(async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token.trim()
                    }
                });
            } catch (reason) {
                console.error(reason.response.data);
                throw {message: 'Fails to create user'};
            }
        });

        it('should get user role with valid token', async function () {
            try {
                const response = await axios.get(hostname + '/users/me/role', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                assert(response.status === 200);
                assert(response.data.role === 'USER');
            } catch (reason) {
                const response = reason.response;
                throw response.data;
            }
        });
        it('should not get user role with invalid token', async function () {
            try {
                await axios.get(hostname + '/users/me/role', {
                    headers: {
                        'Authorization': 'Bearer ' + token + '89798kk'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Fails to verify token');
                assert(response.data.reason === 'JsonWebTokenError: invalid signature');
            }
        });
        it('should not get user role with non token value', async function () {
            try {
                await axios.get(hostname + '/users/me/role', {
                    headers: {
                        'Authorization': 'Bearer 89798kk'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Fails to verify token');
                assert(response.data.reason === 'JsonWebTokenError: jwt malformed');
            }
        });
        it('should not get user role with no authorization header', async function () {
            try {
                await axios.get(hostname + '/users/me/role');
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Identify yourself');
            }
        });
        it('should not get user role with empty authorization header', async function () {
            try {
                await axios.get(hostname + '/users/me/role', {
                    headers: {
                        'Authorization': ''
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Identify yourself');
            }
        });
    });
    describe('Delete user', function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: "Ethan",
                    email: 'ethan@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                token = response.data.token;
            } catch (reason) {
                throw reason.response.data;
            }
        });
        after(async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token.trim()
                    }
                });
            } catch (reason) {
                const data = reason.response.data;
                data.reason = 'afterHook run when there is no such user maybe';
                console.log(data);

            }
        });
        it('should delete a user with valid token', async function () {
            try {
                const response = await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                assert(response.status === 200);
                assert(response.data.message === "User deleted");
            } catch (reason) {
                console.error(reason.response.data);
                throw {message: 'Fails to create user'};
            }
        });
        it('should not delete a user with invalid token', async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token + 'no898'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === "Fails to verify token");
                assert(response.data.reason === "JsonWebTokenError: invalid signature");
            }
        });
        it('should not delete a user with no token', async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer '
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === "Fails to verify token");
                assert(response.data.reason === "JsonWebTokenError: jwt must be provided");
            }
        });
        it('should not delete a user with malformed token', async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer nlkjhuiiugo898'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === "Fails to verify token");
                assert(response.data.reason === "JsonWebTokenError: jwt malformed");
            }
        });
        it('should not delete a user with empty authorization header', async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': ''
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === "Identify yourself");
            }
        });
        it('should not delete a user with no authorization header', async function () {
            try {
                await axios.delete(hostname + '/users/me');
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === "Identify yourself");
            }
        });
    });
    describe('Admin', function () {
        let token = '';
        before(async function () {
            // try {
            //     const admin = {
            //         displayName: "Ethan1",
            //         email: 'eth1@gmail.com',
            //         phoneNumber: '0765456464',
            //         password: 'joshua'
            //     };
            //     const response = await axios.post(hostname + '/users/admin', admin, {
            //         headers: {
            //             'Authorization': 'masterkeytespt'
            //         }
            //     });
            //     ;
            //     // const users = [
            //     //     {
            //     //         displayName: "Ethan1",
            //     //         email: 'eth1@gmail.com',
            //     //         phoneNumber: '0765456464',
            //     //         password: 'joshua'
            //     //     },
            //     //     {
            //     //         displayName: "Ethan3",
            //     //         email: 'ethn3@gmail.com',
            //     //         phoneNumber: '0765456464',
            //     //         password: 'joshua'
            //     //     },
            //     //     {
            //     //         displayName: "Ethan2",
            //     //         email: 'etoan3@gmail.com',
            //     //         phoneNumber: '0765456464',
            //     //         password: 'joshua'
            //     //     }
            //     // ];
            //     // await axios.all([
            //     //     axios.post(hostname + '/users/', users[0]),
            //     //     axios.post(hostname + '/users/', users[1]),
            //     //     axios.post(hostname + '/users/', users[2]),
            //     // ]);
            // } catch (reason) {
            //     console.error(reason.response.data);
            //     throw {message: 'Fails to create users'};
            // }
        });
        after(async function () {
            // try {
            //     await axios.delete(hostname + '/users/me', {
            //         headers: {
            //             'Authorization': 'Bearer ' + token.trim()
            //         }
            //     });
            // } catch (reason) {
            //     const data = reason.response.data;
            //     data.reason = 'afterHook run when there is no such user maybe';
            //     ;
            //
            // }
        });

        it('should create admin user using right masterKey', async function () {
            try {
                const admin = {
                    displayName: "Ethan1",
                    email: 'eth1@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/admin', admin, {
                    headers: {
                        'Authorization': 'masterkeytest'
                    }
                });
                // ;
                assert(response.status === 200);
                assert(response.data.displayName === 'Ethan1');
                assert(response.data.email === 'eth1@gmail.com');
                assert(response.data.phoneNumber === '0765456464');
                assert(response.data.role === 'ADMIN');
                assert(response.data.token !== undefined && response.data.token !== null);
                assert(response.data.uid !== undefined && response.data.uid !== null);
            } catch (reason) {
                throw reason.response.data;
            }
        });
        it('should not create admin user using right masterKey and no data', async function () {
            try {
                await axios.post(hostname + '/users/admin', null, {
                    headers: {
                        'Authorization': 'masterkeytest'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message
                    === 'invalid data supplied, displayName, phoneNumber, email and password required');
            }
        });
        it('should not create admin user using right masterKey and incomplete data', async function () {
            try {
                const user = {
                    displayName: 'Ethan1'
                };
                await axios.post(hostname + '/users/admin', user, {
                    headers: {
                        'Authorization': 'masterkeytest'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 400);
                assert(response.data.message
                    === 'invalid data supplied, displayName, phoneNumber, email and password required');
            }
        });
        it('should not create admin user using wrong masterKey', async function () {
            try {
                const admin = {
                    displayName: "Ethan1",
                    email: 'eth1@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                await axios.post(hostname + '/users/admin', admin, {
                    headers: {
                        'Authorization': 'masterk99kdshdeytest'
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Unauthorized action');
            }
        });
        it('should not create admin user using no masterKey', async function () {
            try {
                const admin = {
                    displayName: "Ethan1",
                    email: 'eth1@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                await axios.post(hostname + '/users/admin', admin, {
                    headers: {
                        'Authorization': ''
                    }
                });
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Unauthorized action');
            }
        });
        it('should not create admin user with no authorization header', async function () {
            try {
                const admin = {
                    displayName: "Ethan1",
                    email: 'eth1@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                await axios.post(hostname + '/users/admin', admin);
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Unauthorized action');
            }
        });
        it('should not create admin user with no authorization header and no user data', async function () {
            try {
                await axios.post(hostname + '/users/admin');
            } catch (reason) {
                const response = reason.response;
                assert(response.status === 401);
                assert(response.data.message === 'Unauthorized action');
            }
        });
        /*
        need to be modified
         */
        describe('All Users', function () {
            let adminToken = '';
            before(async function () {
                try {
                    const admin = {
                        displayName: "Ethan2",
                        email: 'eth2@gmail.com',
                        phoneNumber: '0765456464',
                        password: 'joshua2'
                    };
                    const response = await axios.post(hostname + '/users/admin', admin, {
                        headers: {
                            'Authorization': 'masterkeytest'
                        }
                    });
                    adminToken = response.data.token;
                    // ;
                } catch (reason) {
                    throw reason.response.data;
                }
            });
            after(async function () {
                try {
                    await axios.delete(hostname + '/users/me', {
                        headers: {
                            'Authorization': 'Bearer ' + adminToken,
                        }
                    });
                    // ;
                } catch (reason) {
                    console.log(reason.response.data);
                    console.log('Fails to delete admin');
                }
            });
            it('should get all users with valid admin token', async function () {
                try {
                    const response = await axios.get(hostname + '/users/', {
                        headers: {
                            'Authorization': 'Bearer ' + adminToken
                        }
                    });
                    // ;
                    assert(response.status === 200);
                } catch (reason) {
                    const response = reason.response;
                    ;
                    throw response.data;
                }
            });
            it('should not get all users with invalid admin token', async function () {
                try {
                    await axios.get(hostname + '/users/', {
                        headers: {
                            'Authorization': 'Bearer ' + adminToken + '*y7iiugu'
                        }
                    });
                } catch (reason) {
                    const response = reason.response;
                    // ;
                    assert(response.status === 401);
                    assert(response.data.message === 'Fails to verify token');
                    assert(response.data.reason === 'JsonWebTokenError: invalid token');
                }
            });
        });
    });
    // need more test case
    describe('Update user details', function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: "Joshua3",
                    email: 'josh3@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                token = response.data.token;
            } catch (reason) {
                throw reason.response.data;
            }
        });
        after(async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
            } catch (reason) {
                throw reason.response.data;
            }
        });

        it('should update user details with valid token', async function () {
            try {
                const data = {
                    displayName: 'Joshua33',
                    role: 'ADMIN',
                    uid: 'iy68567iuy',
                    age: 23
                };
                const response = await axios.patch(hostname + '/users/me', data, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                // console.log(response.data);
                assert(response.status === 200);
                assert(response.data.displayName === 'Joshua33');
                assert(response.data.role === 'USER');
                assert(response.data.age === 23);
            } catch (reason) {
                throw reason.reason.data;
            }
        });
    });
    describe('Reset user password', function () {
        let token = '';
        before(async function () {
            try {
                const user = {
                    displayName: "Joshua3",
                    email: 'mama27j@gmail.com',
                    phoneNumber: '0765456464',
                    password: 'joshua'
                };
                const response = await axios.post(hostname + '/users/', user);
                token = response.data.token;
            } catch (reason) {
                throw reason.response.data;
            }
        });
        after(async function () {
            try {
                await axios.delete(hostname + '/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
            } catch (reason) {
                throw reason.response.data;
            }
        });

        it('should send reset password code to user email', async function () {
            try {
                const response = await axios.post(hostname + '/users/password/request', {
                    email: 'mama27j@gmail.com'
                });
                // console.log(response.data);
                assert(response.status === 200);
                assert(response.data.message === 'Follow Instruction sent to email : mama27j@gmail.com');
            } catch (reason) {
                throw reason.response.data;
            }
        });
    });
});
