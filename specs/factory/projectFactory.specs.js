// const assert = require('assert');
// const axios = require('axios');
// const BfastCloud = require('../../lib/bfast-cloud').BfastCloud;
// const OptionsMock = require('./../config/optionsMock').OptionsMock;
// const _MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;
// let _mongoServer;
// let _bfastCloud;
// const hostname = 'http://127.0.0.1:64647';
//
//
// describe('Project Rest API', function () {
//     before(async () => {
//         _mongoServer = new _MongoMemoryServer({
//             autoStart: true,
//         });
//         const mongoUrl = await _mongoServer.getUri(true);
//         process.env.DEBUG = true;
//         process.env.MONGO_URL = mongoUrl;
//         _bfastCloud = new BfastCloud(new OptionsMock().getOptions(mongoUrl));
//     });
//     after(async () => {
//         await _mongoServer.stop();
//         _bfastCloud.stop();
//     });
//
//     describe('Get Projects', function () {
//
//         let token = '';
//         before(async function () {
//             try {
//                 const user = {
//                     displayName: 'Joshua',
//                     email: 'josh1145@gmail.com',
//                     phoneNumber: '0765456638',
//                     password: 'joshua'
//                 };
//                 const response = await axios.post(hostname + '/users/', user);
//                 token = response.data.token;
//                 assert(response.status === 200);
//             } catch (reason) {
//                 throw reason.response.data;
//             }
//         });
//         after(async function () {
//             try {
//                 const response = await axios.delete(hostname + '/users/me', {
//                     headers: {
//                         'Authorization': 'Bearer ' + token
//                     }
//                 });
//                 assert(response.status === 200);
//             } catch (reason) {
//                 throw reason.response.data;
//             }
//         });
//
//         it('should return projects of a user as a member', async () => {
//             const response = await axios.get(`${hostname}/projects`, {
//                 headers: {
//                     'authorization': 'Bearer ' + token,
//                 }
//             });
//             console.log(response.data);
//         });
//
//     });
// });
