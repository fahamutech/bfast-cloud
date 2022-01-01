import bfast from "bfast";
import {assert, expect, should} from "chai";
import {config, mongoRepSet, serverUrl} from "../test.mjs";


describe('Users route', function () {
    before(async function () {
        await mongoRepSet().start();
    });
    describe('register', function () {
        it('should return created user account', async function () {
            const user = await bfast.functions()
                .request('/users')
                .post({
                    displayName: 'joshua',
                    phoneNumber: '07776767',
                    email: 'mama@mama.mama',
                    password: '12345'
                });
            should().exist(user);
            should().exist(user.token);
            should().exist(user.id);
            expect(user.displayName).equal('joshua');
            expect(user.role).equal('USER');
            expect(user.phoneNumber).equal('07776767');
            expect(user.email).equal('mama@mama.mama');
            should().not.exist(user.password);
        });
        it('should not return created user account if missing email', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua',
                        phoneNumber: '07776767',
                        password: '12345'
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('invalid data supplied, displayName, phoneNumber, email and password required')
            }
        });
        it('should not return created user account if missing phone', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua',
                        // phoneNumber: '07776767',
                        password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('invalid data supplied, displayName, phoneNumber, email and password required')
            }
        });
        it('should not return created user account if missing name', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        // displayName: 'joshua',
                        phoneNumber: '07776767',
                        password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('invalid data supplied, displayName, phoneNumber, email and password required')
            }
        });
        it('should not return created user account if missing password', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua',
                        phoneNumber: '07776767',
                        // password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('invalid data supplied, displayName, phoneNumber, email and password required')
            }
        });
        it('should not create user twice', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua',
                        phoneNumber: '07776767',
                        password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('User already exist');
            }
        });
        it('should not create user with same email', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua2',
                        phoneNumber: '0777676767',
                        password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('User already exist');
            }
        });
    });
    describe('login', function () {
        it('should login to exist account', async function () {
            const user = await bfast.functions()
                .request('/users/login')
                .post({
                    email: 'mama@mama.mama',
                    password: '12345'
                });
            should().exist(user);
            should().exist(user.token);
            should().exist(user.id);
            expect(user.displayName).equal('joshua');
            expect(user.role).equal('USER');
            expect(user.phoneNumber).equal('07776767');
            expect(user.email).equal('mama@mama.mama');
            should().not.exist(user.password);
        });
        it('should not login for wrong email', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        email: 'mama@mama.mma',
                        password: '12345'
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('Username is not valid')
            }
        });
        it('should not login for wrong password', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        email: 'mama@mama.mama',
                        password: '1234e5'
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('Password is not valid')
            }
        });
        it('should not login if password not supplied', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        email: 'mama@mama.mama',
                        // password: '1234e5'
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('invalid data supplied')
            }
        });
        it('should not login if email not supplied', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        // email: 'mama@mama.mama',
                        password: '1234e5'
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('invalid data supplied')
            }
        });
        it('should not login if no data supplied', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        // email: 'mama@mama.mama',
                        // password: '1234e5'
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('invalid data supplied')
            }
        });
    });
    describe('role', function () {
        it('should return user role', async function () {
            const user = await bfast.functions()
                .request('/users/login')
                .post({
                    email: 'mama@mama.mama',
                    password: '12345'
                });
            const role = await bfast.functions()
                .request('/users/me/role')
                .get({
                    headers: {
                        Authorization: 'Bearer ' + user.token
                    }
                });
            should().exist(user);
            should().exist(role);
            should().exist(role.role);
            should().exist(role.email);
            expect(role).eql({
                role: 'USER',
                email: 'mama@mama.mama'
            });
        });
        it('should fail if use non exist token', async function () {
            try {
                const role = await bfast.functions()
                    .request('/users/me/role')
                    .get({
                        headers: {
                            Authorization: 'Bearer abc'
                        }
                    });
                should().not.exist(role);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('Fails to verify token');
            }
        });
    });
    describe('details', function () {
        it('should get user details', async function () {
            const user = await bfast.functions()
                .request('/users/login')
                .post({
                    email: 'mama@mama.mama',
                    password: '12345'
                });
            const detail = await bfast.functions()
                .request('/users/me')
                .get({
                    headers: {
                        Authorization: 'Bearer ' + user.token
                    }
                });
            should().exist(user);
            should().exist(detail);
            should().exist(detail.createdAt);
            should().exist(detail.updatedAt);
            should().exist(detail.id);
            expect(detail.displayName).equal('joshua');
            expect(detail.phoneNumber).equal('07776767');
            expect(detail.email).equal('mama@mama.mama');
            expect(detail.username).equal('mama@mama.mama');
            expect(detail.role).equal('USER');
        });
        it('should fail if use non exist token', async function () {
            try {
                const role = await bfast.functions()
                    .request('/users/me')
                    .get({
                        headers: {
                            Authorization: 'Bearer abc'
                        }
                    });
                should().not.exist(role);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('Fails to verify token');
            }
        });
    });
    describe('update details', function () {
        it('should update changeable field for valid token', async function () {
            const user = await bfast.functions()
                .request('/users/login')
                .post({
                    email: 'mama@mama.mama',
                    password: '12345'
                });
            const detail = await bfast.functions()
                .request('/users/me')
                .put({
                    displayName: 'ethan',
                    phoneNumber: '0656',
                    email: 'ethan@ethan.com'
                }, {
                    headers: {
                        Authorization: 'Bearer ' + user.token
                    }
                });
            should().exist(user);
            should().exist(detail);
            should().exist(detail.message);
            expect(detail).eql({message: "done update", modified: 1})
            // should().exist(detail.updatedAt);
            // should().exist(detail.id);
            // expect(detail.displayName).equal('ethan');
            // expect(detail.phoneNumber).equal('0656');
            // expect(detail.email).equal('ethan@ethan.com');
            // expect(detail.username).equal('ethan@ethan.com');
            // expect(detail.role).equal('USER');
        });
        // it('should not update un-changeable field for valid token', async function () {
        //     try {
        //         const user = await bfast.functions()
        //             .request('/users/login')
        //             .post({
        //                 email: 'ethan@ethan.com',
        //                 password: '12345'
        //             });
        //         const detail = await bfast.functions()
        //             .request('/users/me')
        //             .put({
        //                 role: 'ADMIN',
        //         {}
        //             }, {
        //                 headers: {
        //                     Authorization: 'Bearer ' + user.token
        //                 }
        //             });
        //         should().exist(user);
        //         should().exist(detail);
        //         should().exist(detail.id);
        //         expect(detail.role).equal('USER');
        //     }catch (e){
        //         console.log(e?.response?.data);
        //         throw e;
        //     }
        // });
        it('should fail if use non exist token', async function () {
            try {
                const role = await bfast.functions()
                    .request('/users/me')
                    .put({}, {
                        headers: {
                            Authorization: 'Bearer abc'
                        }
                    });
                should().not.exist(role);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('Fails to verify token');
            }
        });
    });
    describe('Reset password', function () {
        let resetToken;
        before(async function () {
            await bfast.functions().request('/users').post({
                displayName: 'josh',
                email: 'josh@josh.com',
                phoneNumber: '0656',
                password: 'josh'
            });
        });
        it('should send reset password', async function () {
            const user = await bfast.functions()
                .request('/users/password/request')
                .post({
                    email: 'josh@josh.com',
                    local: true
                });
            should().exist(user);
            should().exist(user.token);
            expect(user.message).equal('Follow Instruction sent to email : josh@josh.com');
            resetToken = user.token;
        });
        it('should not send reset password link if email not recognised', async function () {
            try {
                const user = await bfast.functions()
                    .request('/users/password/request')
                    .post({
                        email: 'joshoo@josh.com',
                        local: true
                    });
                should().not.exist(user);
            } catch (e) {
                should().exist(e);
                console.log(e?.response?.data);
                expect(e?.message).equal('User record with that email not found');
            }
        });
        it('should change password when given correct code', async function () {
            const r = await bfast.functions().request('/users/password/reset')
                .post({
                    code: resetToken,
                    password: 'ethan'
                });
            should().exist(r);
            expect(r).eql({
                message: 'Password updated'
            });
            const logIn = await bfast.functions().request('/users/login')
                .post({
                    email: 'josh@josh.com',
                    password: 'ethan'
                });
            should().exist(logIn);
            should().exist(logIn.token);
        });
    });
    describe('admin', function () {
        it('should add super admin user', async function () {
            const user = await bfast.functions().request('/users/admin')
                .post({
                    displayName: 'ethan',
                    phoneNumber: '0656',
                    email: 'ethan@admin.com',
                    password: 'admin'
                }, {
                    headers: {
                        Authorization: config.masterKey
                    }
                });
            should().exist(user);
            should().exist(user.token);
            should().exist(user.id);
            expect(user.displayName).equal('ethan');
            expect(user.role).equal('ADMIN');
            expect(user.phoneNumber).equal('0656');
            expect(user.email).equal('ethan@admin.com');
            should().not.exist(user.password);
        });
        it('should not create a super admin for wrong master key', async function () {
            try {
                const user = await bfast.functions().request('/users/admin')
                    .post({
                        displayName: 'ethan',
                        phoneNumber: '0656',
                        email: 'ethan@admin.com',
                        password: 'admin'
                    });
                should.not.exist(user);
            } catch (e) {
                should().exist(e);
                expect(e).eql({message: 'Unauthorized action'})
            }
        });
        it('should not create a super admin for if no phone', async function () {
            try {
                const user = await bfast.functions().request('/users/admin')
                    .post({
                        displayName: 'ethan',
                        // phoneNumber: '0656',
                        email: 'ethan@admin.com',
                        password: 'admin'
                    }, {
                        headers: {
                            Authorization: config.masterKey
                        }
                    });
                should.not.exist(user);
            } catch (e) {
                should().exist(e);
                // console.log(e?.response?.data);
                expect(e).eql({
                    message: 'invalid data supplied, displayName, phoneNumber, email and password required'
                });
            }
        });
        it('should not create a super admin for if no name', async function () {
            try {
                const user = await bfast.functions().request('/users/admin')
                    .post({
                        // displayName: 'ethan',
                        phoneNumber: '0656',
                        email: 'ethan@admin.com',
                        password: 'admin'
                    }, {
                        headers: {
                            Authorization: config.masterKey
                        }
                    });
                should.not.exist(user);
            } catch (e) {
                should().exist(e);
                // console.log(e?.response?.data);
                expect(e).eql({
                    message: 'invalid data supplied, displayName, phoneNumber, email and password required'
                });
            }
        });
        it('should not create a super admin for if no email', async function () {
            try {
                const user = await bfast.functions().request('/users/admin')
                    .post({
                        displayName: 'ethan',
                        phoneNumber: '0656',
                        // email: 'ethan@admin.com',
                        password: 'admin'
                    }, {
                        headers: {
                            Authorization: config.masterKey
                        }
                    });
                should.not.exist(user);
            } catch (e) {
                should().exist(e);
                // console.log(e?.response?.data);
                expect(e).eql({
                    message: 'invalid data supplied, displayName, phoneNumber, email and password required'
                });
            }
        });
        it('should not create a super admin for if no password', async function () {
            try {
                const user = await bfast.functions().request('/users/admin')
                    .post({
                        displayName: 'ethan',
                        phoneNumber: '0656',
                        email: 'ethan@admin.com',
                        // password: 'admin'
                    }, {
                        headers: {
                            Authorization: config.masterKey
                        }
                    });
                should.not.exist(user);
            } catch (e) {
                should().exist(e);
                // console.log(e?.response?.data);
                expect(e).eql({
                    message: 'invalid data supplied, displayName, phoneNumber, email and password required'
                });
            }
        });
        it('should not repeat create exist admin', async function () {
            try {
                const user = await bfast.functions().request('/users/admin')
                    .post({
                        displayName: 'ethan',
                        phoneNumber: '0656',
                        email: 'ethan@admin.com',
                        password: 'admin'
                    }, {
                        headers: {
                            Authorization: config.masterKey
                        }
                    });
                should.not.exist(user);
            } catch (e) {
                should().exist(e);
                // console.log(e?.response?.data);
                expect(e).eql({
                    message: 'User already exist'
                });
            }
        });
        it('should login for supper admin', async function () {
            const user = await bfast.functions()
                .request('/users/login')
                .post({
                    email: 'ethan@admin.com',
                    password: 'admin'
                });
            should().exist(user);
            should().exist(user.token);
            should().exist(user.id);
            expect(user.displayName).equal('ethan');
            expect(user.role).equal('ADMIN');
            should().not.exist(user.password);
        });
    });
    describe('all users', function () {
        let token;
        before(async function () {
            token = (await bfast.functions().request('/users/login').post({
                email: 'ethan@admin.com',
                password: 'admin'
            })).token;
        });
        it('should get all user for admin', async function () {
            const users = await bfast.functions().request('/users').get({
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            should().exist(users);
            expect(users).length(3);
        });
        it('should not get all users for bad token', async function () {
            try {
                const users = await bfast.functions().request('/users').get({
                    headers: {
                        Authorization: `Bearer abc`
                    }
                });
                should().not.exist(users);
            } catch (e) {
                should().exist(e);
                // console.log(e?.response?.data);
                expect(e?.message).equal('Fails to verify token');
            }
        });
        it('should not get all users for non admin user', async function () {
            try {
                const u = await bfast.functions().request('/users/login').post({
                    email: 'josh@josh.com',
                    password: 'ethan'
                });
                const users = await bfast.functions().request('/users').get({
                    headers: {
                        Authorization: `Bearer ${u.token}`
                    }
                });
                should().not.exist(users);
            } catch (e) {
                should().exist(e);
                expect(e?.message).equal('Forbidden request');
            }
        });
    });
    describe('delete account', function () {
        it('should delete a user account', async function () {
            const u = await bfast.functions().request('/users/login').post({
                email: 'josh@josh.com',
                password: 'ethan'
            });
            const users = await bfast.functions().request('/users/me').delete({
                headers: {
                    Authorization: `Bearer ${u.token}`
                }
            });
            // console.log(users);
            should().exist(users);
            expect(users).length(1);
            should().exist(users[0].id);
        });
    });
});
