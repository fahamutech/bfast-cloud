import {DatabaseAdapter, UsersStoreAdapter} from "../adapter/database";
import {UserModel, UserRoles} from "../model/user";
import {SecurityAdapter} from "../adapter/security";
import {EmailAdapter} from "../adapter/email";
import {Options} from "../config/Options";
import {SecurityFactory} from "./SecurityFactory";
import {EmailFactory} from "./EmailFactory";
import {DatabaseConfigFactory} from "./DatabaseConfigFactory";

let _security: SecurityAdapter;
let _emailAdapter: EmailAdapter;
let _database: DatabaseAdapter;
let _options: Options;

// todo: composition of security and emailAdapter factory must be moved to controller
export class UserStoreFactory implements UsersStoreAdapter {
    collectionName = '_User';

    constructor(private  options: Options) {
        _options = this.options;
        _security = this.options.securityAdapter ?
            this.options.securityAdapter : new SecurityFactory(this.options);
        _emailAdapter = this.options.emailAdapter ?
            this.options.emailAdapter : new EmailFactory();
        _database = this.options.databaseConfigAdapter ?
            this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options);
    }

    async createUser(user: UserModel): Promise<any> {
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
            user.uid = insertUser.insertedId as string;
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

    async createAdmin(user: UserModel): Promise<any> {
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
            user.uid = insertUser.insertedId as string;
            delete user.password;
            user.token = await _security.generateToken({uid: insertUser.insertedId as string});
            return user;
        } catch (reason) {
            throw {message: 'Admin not created', reason: reason.toString()};
        }
    }

    // under discussion
    async deleteUser(userId: string): Promise<any> {
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

    async getAllUsers(size?: number, skip?: number): Promise<any> {
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

    async getUser(userId: string): Promise<any> {
        try {
            const userCollection = await _database.collection(this.collectionName);
            const user = await userCollection.findOne({_id: _database.getObjectId(userId)});
            user.uid = user._id;
            delete user.password;
            return user;
        } catch (e) {
            console.error(e);
        }
    }

    async login(email: string, password: string): Promise<any> {
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

    async updateUserDetails(userId: string, data: UserModel): Promise<UserModel> {
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
    async requestResetPassword(email: string): Promise<any> {
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
                'Joshua Mshana',
                'Password reset',
                `
                Use this link to reset your password : <br>
                <a href="${host}/ui/password/reset/?token=${code}">
                    ${host}/ui/password/reset/?token=${code}
                </a>`
            );
            return {message: 'Follow Instruction sent to email : ' + user.email};
        } catch (e) {
            console.error(e);
            throw {message: 'Fail to send reset password email', reason: e.toString()};
        }
    }

    async getRole(userId: string): Promise<any> {
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
    async resetPassword(code: string, password: string): Promise<any> {
        try {
            await _security.verifyToken(code);
            const decodedEmail = _security.decodeToken(code);
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
            throw {message: "Reset password fails", reason: e.toString()};
        }
    }

}
