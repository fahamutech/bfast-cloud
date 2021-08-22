import {SecurityFactory} from "./security.factory.mjs";
import {EmailFactory} from "./email.factory.mjs";
import {DatabaseConfigFactory} from "./database-config.factory.mjs";
import {UserRoles} from "../models/user.model.mjs";
import {v4} from 'uuid';
import bfast from "bfast";

export class UserStoreFactory {
    collectionName = '_User';

    /**
     *
     * @param databaseFactory {DatabaseConfigFactory}
     * @param emailFactory {EmailFactory}
     * @param securityFactory {SecurityFactory}
     */
    constructor(databaseFactory, emailFactory, securityFactory) {
        this._database = databaseFactory;
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
        user.role = 'USER';
        const _user = await bfast.auth().signUp(user.email, user.password, user);
        _user.token = await this._security.generateToken({uid: user.id, email: user.email});
        return _user;
    }

    /**
     *
     * @param user
     * @return {Promise<*>}
     */
    async createAdmin(user) {
        delete user.uid;
        const date = new Date().toISOString();
        user.createdAt = date;
        user.updatedAt = date;
        user._id = v4();
        user.password = await this._security.encryptPassword(user.password);
        user.role = UserRoles.ADMIN_ROLE;
        const adminCollection = await this._database.collection(this.collectionName);
        const insertUser = await adminCollection.insertOne(user);
        const indexExist = await adminCollection.indexExists('email');
        if (!indexExist) {
            await adminCollection.createIndex({email: 1}, {unique: true});
        }
        user.uid = insertUser.insertedId.toString();
        delete user.password;
        user.token = await this._security.generateToken({uid: insertUser.insertedId.toString()});
        return user;
    }

    /**
     *
     * @param userId {string}
     * @return {Promise<{message: string}>}
     */
    async deleteUser(userId) {
        try {
            const userCollection = await this._database.collection(this.collectionName);
            const response = await userCollection.deleteOne({_id: this._database.getObjectId(userId)});
            if (response && response.deletedCount === 1 && response.result.ok === 1) {
                return {message: "User deleted"};
            } else {
                throw {message: 'user not deleted'};
            }
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @return {Promise<*>}
     */
    async getAllUsers() {
        try {
            const userCollection = await this._database.collection(this.collectionName);
            const total = await userCollection.find({}).count();
            return await userCollection.find({})
                .skip(0)
                .limit(total)
                .project({password: 0})
                .toArray();
        } finally {
            this._database.disconnect();
        }
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
     * @return {Promise<string>}
     */
    async resetPassword(code, password) {
        try {
            const decodedEmail = await this._security.verifyToken(code);
            if (!password) {
                throw {message: 'Please provide a new password'};
            }
            if (decodedEmail && decodedEmail.email) {
                const hashedPassword = await this._security.encryptPassword(password);
                const userCollection = await this._database.collection(this.collectionName);
                await userCollection.findOneAndUpdate({email: decodedEmail.email, resetCode: code}, {
                    $set: {
                        password: hashedPassword,
                        resetCode: null
                    },
                    $currentDate: {
                        updatedAt: true
                    }
                });
                await this._security.revokeToken(code);
                return 'Password updated';
            } else {
                throw {message: 'code is invalid'};
            }
        } finally {
            this._database.disconnect();
        }
    }

}
