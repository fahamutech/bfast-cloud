const bfast = require("bfast");
const {should, expect, assert} = require('chai');
const {mongoRepSet, config, serverUrl} = require("../test.config");
const {init, database} = require("bfast");

describe('Users', function () {
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
            try{
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua',
                        phoneNumber: '07776767',
                        password: '12345'
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('invalid data supplied, displayName, phoneNumber, email and password required')
            }
        });
        it('should not return created user account if missing phone', async function () {
            try{
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua',
                        // phoneNumber: '07776767',
                        password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('invalid data supplied, displayName, phoneNumber, email and password required')
            }
        });
        it('should not return created user account if missing name', async function () {
            try{
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        // displayName: 'joshua',
                        phoneNumber: '07776767',
                        password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('invalid data supplied, displayName, phoneNumber, email and password required')
            }
        });
        it('should not return created user account if missing password', async function () {
            try{
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua',
                        phoneNumber: '07776767',
                        // password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('invalid data supplied, displayName, phoneNumber, email and password required')
            }
        });
        it('should not create user twice', async function () {
            try{
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua',
                        phoneNumber: '07776767',
                        password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('User already exist');
            }
        });
        it('should not create user with same email', async function () {
            try{
                const user = await bfast.functions()
                    .request('/users')
                    .post({
                        displayName: 'joshua2',
                        phoneNumber: '0777676767',
                        password: '12345',
                        email: 'mama@mama.mama',
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('User already exist');
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
            try{
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        email: 'mama@mama.mma',
                        password: '12345'
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('Username is not valid')
            }
        });
        it('should not login for wrong password', async function () {
            try{
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        email: 'mama@mama.mama',
                        password: '1234e5'
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('Password is not valid')
            }
        });
        it('should not login if password not supplied', async function () {
            try{
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        email: 'mama@mama.mama',
                        // password: '1234e5'
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('invalid data supplied')
            }
        });
        it('should not login if email not supplied', async function () {
            try{
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        // email: 'mama@mama.mama',
                        password: '1234e5'
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('invalid data supplied')
            }
        });
        it('should not login if no data supplied', async function () {
            try{
                const user = await bfast.functions()
                    .request('/users/login')
                    .post({
                        // email: 'mama@mama.mama',
                        // password: '1234e5'
                    });
                should().not.exist(user);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('invalid data supplied')
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
                        Authorization: 'Bearer '+user.token
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
            try{
                const role = await bfast.functions()
                    .request('/users/me/role')
                    .get({
                        headers: {
                            Authorization: 'Bearer abc'
                        }
                    });
                should().not.exist(role);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('Fails to verify token');
            }
        });
    });
    describe('details', function () {
        it('should get user details',async function () {
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
                        Authorization: 'Bearer '+user.token
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
            try{
                const role = await bfast.functions()
                    .request('/users/me')
                    .get({
                        headers: {
                            Authorization: 'Bearer abc'
                        }
                    });
                should().not.exist(role);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('Fails to verify token');
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
                },{
                    headers: {
                        Authorization: 'Bearer '+user.token
                    }
                });
            should().exist(user);
            should().exist(detail);
            should().exist(detail.createdAt);
            should().exist(detail.updatedAt);
            should().exist(detail.id);
            expect(detail.displayName).equal('ethan');
            expect(detail.phoneNumber).equal('0656');
            expect(detail.email).equal('ethan@ethan.com');
            expect(detail.username).equal('ethan@ethan.com');
            expect(detail.role).equal('USER');
        });
        it('should not update un-changeable field for valid token', async function () {
            const user = await bfast.functions()
                .request('/users/login')
                .post({
                    email: 'mama@mama.mama',
                    password: '12345'
                });
            const detail = await bfast.functions()
                .request('/users/me')
                .put({
                    role: 'ADMIN'
                },{
                    headers: {
                        Authorization: 'Bearer '+user.token
                    }
                });
            should().exist(user);
            should().exist(detail);
            should().exist(detail.id);
            expect(detail.role).equal('USER');
        });
        it('should fail if use non exist token', async function () {
            try{
                const role = await bfast.functions()
                    .request('/users/me')
                    .put({},{
                        headers: {
                            Authorization: 'Bearer abc'
                        }
                    });
                should().not.exist(role);
            }catch (e){
                should().exist(e);
                expect(e?.response?.data?.message).equal('Fails to verify token');
            }
        });
    });

    describe('requestResetPasswordCode', function () {
        let resetToken;
        before(async function (){
           await bfast.auth().signUp('josh','josh@josh.com', {email: 'josh@josh.com'});
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
    });

});
