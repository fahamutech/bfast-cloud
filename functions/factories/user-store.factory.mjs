import {SecurityFactory} from "./security.factory.mjs";
import {EmailFactory} from "./email.factory.mjs";
import {UserRoles} from "../models/user.model.mjs";
import bfast from "bfast";

export class UserStoreFactory {
    collectionName = '_User';

    /**
     * @param emailFactory {EmailFactory}
     * @param securityFactory {SecurityFactory}
     */
    constructor(emailFactory, securityFactory) {
        this._emailAdapter = emailFactory;
        this._security = securityFactory;
    }

    /**
     *
     * @param token {string}
     * @return {Promise<*>}
     */
    async logoutFromAllDevice(token) {
        try {
            return await this._security.revokeToken(token);
        } catch (e) {
            throw {message: 'Fails to log you out from all devices', reason: e.toString()};
        }
    }

    /**
     *
     * @param user
     * @return {Promise<*>}
     */
    async createUser(user) {
        delete user.uid;
        user.role = UserRoles.USER_ROLE;
        const _user = await bfast.auth().signUp(user.email, user.password, user);
        _user.token = await this._security.generateToken({uid: _user.id, email: _user.email});
        return _user;
    }

    /**
     *
     * @param user
     * @return {Promise<*>}
     */
    async createAdmin(user) {
        delete user.uid;
        user.role = UserRoles.ADMIN_ROLE;
        const _user = await bfast.auth().signUp(user.email, user.password, user);
        _user.token = await this._security.generateToken({uid: _user.id, email: _user.email});
        return _user;
    }

    /**
     *
     * @param userId {string}
     * @return {Promise<{message: string}>}
     */
    async deleteUser(userId) {
        return bfast.database().table('_User')
            .query()
            .byId(userId)
            .delete({useMasterKey: true});
    }

    /**
     *
     * @return {Promise<*>}
     */
    async getAllUsers() {
        const users = await bfast.database().table('_User').getAll(null, {useMasterKey: true});
        return users.map(x => {
            delete x.password;
            return x;
        });
    }

    /**
     *
     * @param userId {string}
     * @return {Promise<*>}
     */
    async getUser(userId) {
        const user = await bfast.database().table('_User')
            .get(userId, null, {useMasterKey: true});
        delete user.password;
        return user;
    }

    /**
     *
     * @param email {string}
     * @param password {string}
     * @return {Promise<*>}
     */
    async login(email, password) {
        const user = await bfast.auth().logIn(email, password);
        delete user.password;
        delete user.resetCode;
        user.token = await this._security.generateToken({uid: user.id, email: user.email});
        user.uid = user._id;
        return user;
    }

    /**
     *
     * @param userId {string}
     * @param data {object}
     * @return {Promise<*>}
     */
    async updateUserDetails(userId, data) {
        data = JSON.parse(JSON.stringify(data));
        delete data.role;
        delete data.uid;
        delete data.id;
        delete data.password;
        delete data.createdAt;
        if (data.email) {
            data.username = data.email;
        }
        const user = await bfast.database()
            .table('_User')
            .query()
            .byId(userId)
            .updateBuilder()
            .doc(data)
            .update({useMasterKey: true});
        delete user.password;
        delete user.token;
        return user;
    }

    // need to be implemented
    // todo: implement password reset mechanism
    // todo: remove security and email code to a controller
    /**
     *
     * @param email {string}
     * @param devMode
     * @param port
     * @return {Promise<{message: string, token: *}|{message: string}>}
     */
    async requestResetPassword(email, devMode = false, port = 3000) {
        const users = await bfast.database()
            .table('_User')
            .query()
            .equalTo('email', email)
            .find({useMasterKey: true});
        if (Array.isArray(users) && users.length === 1) {
            const user = users[0];
            const code = await this._security.generateToken({email: email}, '30m');
            await bfast.database().table('_User')
                .query()
                .byId(users[0].id)
                .updateBuilder()
                .set('resetCode', code)
                .update({useMasterKey: true});
            const emails = [];
            emails.push(email);
            const host = devMode ? 'http://127.0.0.1:' + port
                : 'https://api.bfast.fahamutech.com';
            await this._emailAdapter.sendMail(
                {
                    from: `BFast::Cloud <fahamutechdevelopers@gmail.com>`,
                    subject: 'Password Reset',
                    to: emails,
                    html: `Use this link to reset your password :  <a href="${host}/ui/password/reset/?token=${code}">Click to reset your password</a>`
                },
                devMode
            );
            if (devMode) {
                return {message: 'Follow Instruction sent to email : ' + user.email, token: code};
            } else {
                return {message: 'Follow Instruction sent to email : ' + user.email};
            }
        } else {
            throw {message: 'User record with that email not found'};
        }
    }

    /**
     *
     * @param userId {string}
     * @return {Promise<{role: string, email: string}>}
     */
    async getRole(userId) {
        const user = await bfast.database()
            .table('_User')
            .get(userId, null, {useMasterKey: true});
        return {role: user.role, email: user.email};
    }

    // todo: remove security, and add it in controller
    /**
     *
     * @param code {string}
     * @param password {string}
     * @return {Promise<*>}
     */
    async resetPassword(code, password) {
        const decodedEmail = await this._security.verifyToken(code);
        if (!password) {
            throw {message: 'Please provide a new password'};
        }
        if (decodedEmail && decodedEmail.email) {
            const hashedPassword = await this._security.encryptPassword(password);
            await bfast.database().table('_User')
                .query()
                .equalTo('email', decodedEmail.email)
                .equalTo('resetCode', code)
                .updateBuilder()
                .set('password', hashedPassword)
                .set('resetCode', null)
                .update({useMasterKey: true});
            await this._security.revokeToken(code);
            return {message: 'Password updated'};
        } else {
            throw {message: 'code is invalid'};
        }
    }

}
