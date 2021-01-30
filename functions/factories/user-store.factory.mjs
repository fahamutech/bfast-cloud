import {SecurityFactory} from "./security.factory.mjs";
import {EmailFactory} from "./email.factory.mjs";
import {DatabaseConfigFactory} from "./database-config.factory.mjs";
import {UserRoles} from "../models/user.model.mjs";
import {v4} from 'uuid';

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
        try {
            delete user.uid;
            const date = new Date().toISOString();
            user.createdAt = date;
            user._id = v4();
            user.updatedAt = date;
            user.username = user.email;
            user.password = await this._security.encryptPassword(user.password);
            user.role = UserRoles.USER_ROLE;
            const userCollection = await this._database.collection(this.collectionName);
            const insertUser = await userCollection.insertOne(user);
            const indexExist = await userCollection.indexExists('email');
            if (!indexExist) {
                await userCollection.createIndex({email: 1}, {unique: true});
            }
            user.uid = insertUser.insertedId.toString();
            delete user.password;
            user.token = await this._security.generateToken({uid: insertUser.insertedId.toString()});
            return user;
        } catch (e) {
            console.error(e);
            throw {
                message: 'user not created',
                reason: e.code && e.code === 11000 ? 'Email is already in use' : e.toString()
            };
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param user
     * @return {Promise<*>}
     */
    async createAdmin(user) {
        try {
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
        } finally {
            this._database.disconnect();
        }
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
     * @param size {number}
     * @param skip {number}
     * @return {Promise<*>}
     */
    async getAllUsers(size, skip) {
        try {
            const userCollection = await this._database.collection(this.collectionName);
            return await userCollection.find({})
                .skip(skip ? skip : 0)
                .limit(size ? size : 100)
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
        try {
            const userCollection = await this._database.collection(this.collectionName);
            const user = await userCollection.findOne({_id: this._database.getObjectId(userId)});
            if (user) {
                user.uid = user._id;
                delete user.password;
                return user;
            } else {
                throw 'No such user in records'
            }
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param email {string}
     * @param password {string}
     * @return {Promise<*>}
     */
    async login(email, password) {
        try {
            const userCollection = await this._database.collection(this.collectionName);
            const user = await userCollection.findOne({email: email});
            if (!user) {
                throw 'User with that email not exist';
            }
            const passwordOk = await this._security.comparePassword(password, user.password);
            if (!passwordOk) {
                throw 'Password/Username is incorrect'
            }
            delete user.password;
            user.token = await this._security.generateToken({uid: user._id});
            user.uid = user._id;
            return user;
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param userId {string}
     * @param data {object}
     * @return {Promise<*>}
     */
    async updateUserDetails(userId, data) {
        try {
            data = JSON.parse(JSON.stringify(data));
            delete data.role;
            delete data.uid;
            delete data.createdAt;
            const userCollection = await this._database.collection(this.collectionName);
            await userCollection.findOneAndUpdate({_id: this._database.getObjectId(userId)}, {
                $set: data,
                $currentDate: {
                    updatedAt: true
                }
            });
            return await this.getUser(userId);
        } finally {
            this._database.disconnect();
        }
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
        try {
            const userCollection = await this._database.collection(this.collectionName);
            const user = await userCollection.findOne({email: email});
            if (!user) {
                throw 'User record with that email not found';
            }
            const code = await this._security.generateToken({email: email}, '30m');
            await userCollection.findOneAndUpdate({email: email}, {
                $set: {
                    resetCode: code
                },
                $currentDate: {
                    updatedAt: true
                }
            });
            const emails = [];
            emails.push(email);
            const host = devMode ? 'http://127.0.0.1:' + port
                : 'http://api.bfast.fahamutech.com';
            await this._emailAdapter.sendMail(
                {
                    from: `BFast::Cloud <bfast@fahamutech.com>`,
                    subject: 'Password Reset',
                    to: emails,
                    html: `Use this link to reset your password :  <a href="${host}/ui/password/reset/?token=${code}">Click to reset your password</a>`
                }
            );
            if (devMode) {
                return {message: 'Follow Instruction sent to email : ' + user.email, token: code};
            } else {
                return {message: 'Follow Instruction sent to email : ' + user.email};
            }
        } catch (e) {
            console.error(e);
            throw {message: 'Fail to send reset password email', reason: e.toString()};
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param userId {string}
     * @return {Promise<{role: string, email: string}>}
     */
    async getRole(userId) {
        try {
            const userCollection = await this._database.collection(this.collectionName);
            const user = await userCollection.findOne({_id: this._database.getObjectId(userId)});
            if (!user) {
                throw 'no such user in records';
            }
            return {role: user.role, email: user.email};
        } catch (e) {
            console.error(e);
            throw {message: 'user role can not be determined', reason: e.toString()}
        } finally {
            this._database.disconnect();
        }
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
