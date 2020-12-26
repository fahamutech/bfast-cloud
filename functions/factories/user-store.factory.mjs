import {SecurityFactory} from "./security.factory.mjs";
import {EmailFactory} from "./email.factory.mjs";
import {DatabaseConfigFactory} from "./database-config.factory.mjs";
import {UserModel, UserRoles} from "../models/user.model.mjs";
import {BfastConfig} from "../configs/bfast.config.mjs";

let _security;
let _emailAdapter;
let _database;
let _options;

// todo: composition of security and emailAdapter factory must be moved to controller
export class UserStoreFactory {
    collectionName = '_User';

    /**
     *
     * @param options {BfastConfig}
     */
    constructor(options) {
        this.options = options;
        _options = this.options;
        _security = this.options.securityAdapter ?
            this.options.securityAdapter : new SecurityFactory(this.options);
        _emailAdapter = this.options.emailAdapter ?
            this.options.emailAdapter : new EmailFactory();
        _database = this.options.databaseConfigAdapter ?
            this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options);
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
            user.updatedAt = date;
            user.password = await _security.encryptPassword(user.password);
            user.role = UserRoles.USER_ROLE;
            const userCollection = await _database.collection(this.collectionName);
            const insertUser = await userCollection.insertOne(user);
            const indexExist = await userCollection.indexExists('email');
            if (!indexExist) {
                await userCollection.createIndex({email: 1}, {unique: true});
            }
            user.uid = insertUser.insertedId
            as
            string;
            delete user.password;
            user.token = await _security.generateToken({uid: insertUser.insertedId as string});
            return user;
        } catch (e) {
            console.error(e);
            throw {
                message: 'user not created',
                reason: e.code && e.code === 11000 ? 'Email is already in use' : e.toString()
            };
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
            user.password = await _security.encryptPassword(user.password);
            user.role = UserRoles.ADMIN_ROLE;
            const adminCollection = await _database.collection(this.collectionName);
            const insertUser = await adminCollection.insertOne(user);
            const indexExist = await adminCollection.indexExists('email');
            if (!indexExist) {
                await adminCollection.createIndex({email: 1}, {unique: true});
            }
            user.uid = insertUser.insertedId
            as
            string;
            delete user.password;
            user.token = await _security.generateToken({uid: insertUser.insertedId as string});
            return user;
        } catch (reason) {
            throw {message: 'Admin not created', reason: reason.toString()};
        }
    }

    /**
     *
     * @param userId {string}
     * @return {Promise<{message: string}>}
     */
    async deleteUser(userId) {
        try {
            const userCollection = await _database.collection(this.collectionName);
            const response = await userCollection.deleteOne({_id: _database.getObjectId(userId)});
            if (response && response.deletedCount === 1 && response.result.ok === 1) {
                return {message: "User deleted"};
            } else {
                throw 'Operation was not successful';
            }
        } catch (e) {
            console.error(e);
            throw {message: 'user not deleted'};
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
            const userCollection = await _database.collection(this.collectionName);
            return await userCollection.find({})
                .skip(skip ? skip : 0)
                .limit(size ? size : 100)
                .project({password: 0})
                .toArray();
        } catch (e) {
            console.error(e);
            throw {message: 'can not list all users'}
        }
    }

    /**
     *
     * @param userId {string}
     * @return {Promise<*>}
     */
    async getUser(userId) {
        try {
            const userCollection = await _database.collection(this.collectionName);
            const user = await userCollection.findOne < UserModel > ({_id: _database.getObjectId(userId)});
            if (user) {
                user.uid = user._id;
                delete user.password;
                return user;
            } else {
                throw 'No such user in records'
            }
        } catch (e) {
            console.error(e);
            throw e;
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
            const userCollection = await _database.collection(this.collectionName);
            const user = await userCollection.findOne({email: email});
            if (!user) {
                throw 'User with that email not exist';
            }
            const passwordOk = await _security.comparePassword(password, user.password);
            if (!passwordOk) {
                throw 'Password/Username is incorrect'
            }
            delete user.password;
            user.token = await _security.generateToken({uid: user._id});
            user.uid = user._id;
            return user;
        } catch (e) {
            console.error(e);
            throw {message: 'Fails to login', reason: e.toString()}
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
            const userCollection = await _database.collection(this.collectionName);
            await userCollection.findOneAndUpdate({_id: _database.getObjectId(userId)}, {
                $set: data,
                $currentDate: {
                    updatedAt: true
                }
            });
            return await this.getUser(userId);
        } catch (e) {
            console.error(e);
            throw {message: 'fail to update user details', reason: e.toString()}
        }
    }

    // need to be implemented
    // todo: implement password reset mechanism
    // todo: remove security and email code to a controller
    /**
     *
     * @param email {string}
     * @return {Promise<{message: string, token: *}|{message: string}>}
     */
    async requestResetPassword(email) {
        try {
            const userCollection = await _database.collection(this.collectionName);
            const user = await userCollection.findOne({email: email});
            if (!user) {
                throw 'User record with that email not found';
            }
            const code = await _security.generateToken({email: email}, '30m');
            await userCollection.findOneAndUpdate({email: email}, {
                $set: {
                    resetCode: code
                },
                $currentDate: {
                    updatedAt: true
                }
            });
            const host = _options.devMode ? 'http://127.0.0.1:' + _options.port
                : 'http://api.bfast.fahamutech.com';
            await _emailAdapter.sendEmail(
                email,
                'BFast::Cloud',
                'Password reset',
                `
                Use this link to reset your password : <br>
                <a href="${host}/ui/password/reset/?token=${code}">
                    Click to reset your password
                </a>`
            );
            if (_options.devMode) {
                return {message: 'Follow Instruction sent to email : ' + user.email, token: code};
            } else {
                return {message: 'Follow Instruction sent to email : ' + user.email};
            }
        } catch (e) {
            console.error(e);
            throw {message: 'Fail to send reset password email', reason: e.toString()};
        }
    }

    /**
     *
     * @param userId {string}
     * @return {Promise<{role: *}>}
     */
    async getRole(userId) {
        try {
            const userCollection = await _database.collection(this.collectionName);
            const user = await userCollection.findOne({_id: _database.getObjectId(userId)});
            if (!user) {
                throw 'no such user in records';
            }
            return {role: user.role};
        } catch (e) {
            console.error(e);
            throw {message: 'user role can not be determined', reason: e.toString()}
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
            const decodedEmail = await _security.verifyToken(code);
            if (!password) {
                throw 'Please provide a new password';
            }
            if (decodedEmail && decodedEmail.email) {
                const hashedPassword = await _security.encryptPassword(password);
                const userCollection = await _database.collection(this.collectionName);
                await userCollection.findOneAndUpdate({email: decodedEmail.email, resetCode: code}, {
                    $set: {
                        password: hashedPassword,
                        resetCode: null
                    },
                    $currentDate: {
                        updatedAt: true
                    }
                });
                await _security.revokeToken(code);
                return 'Password updated';
            } else {
                throw 'code is invalid';
            }
        } catch (e) {
            console.log(e);
            throw {message: "Reset password fails", reason: e.toString()};
        }
    }

}
