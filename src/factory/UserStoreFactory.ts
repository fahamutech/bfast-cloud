import {DatabaseAdapter, UsersStoreAdapter} from "../adapter/database";
import {UserModel, UserRoles} from "../model/user";
import {SecurityAdapter} from "../adapter/security";
import {EmailAdapter} from "../adapter/email";
import {Options} from "../config/Options";
import {SecurityFactory} from "./SecurityFactory";
import {EmailFactory} from "./EmailFactory";
import {DatabaseConfigFactory} from "./DatabaseConfigFactory";

let security: SecurityAdapter;
let emailAdapter: EmailAdapter;
let database: DatabaseAdapter;

// todo: composition of security and emailAdapter factory must be moved to controller
export class UserStoreFactory implements UsersStoreAdapter {
    collectionName = '_User';

    constructor(private  options: Options) {
        security = this.options.securityAdapter ?
            this.options.securityAdapter : new SecurityFactory(this.options);
        emailAdapter = this.options.emailAdapter ?
            this.options.emailAdapter : new EmailFactory();
        database = this.options.databaseConfigAdapter ?
            this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options);
    }

    async createUser(user: UserModel): Promise<any> {
        try {
            delete user.uid;
            user.createdAt = Date.now();
            user.password = await security.encryptPassword(user.password);
            user.role = UserRoles.USER_ROLE;
            const userCollection = await database.collection(this.collectionName);
            const insertUser = await userCollection.insertOne(user);
            const indexExist = await userCollection.indexExists('email');
            if (!indexExist) {
                await userCollection.createIndex({email: 1}, {unique: true});
            }
            user.uid = insertUser.insertedId as string;
            delete user.password;
            user.token = await security.generateToken({uid: insertUser.insertedId as string});
            return user;
        } catch (e) {
            console.error(e);
            throw {
                message: 'user not created',
                reason: e.code && e.code === 11000 ? 'Email is already in use' : e.toString()
            };
        }
    }

    // under discussion
    async deleteUser(userId: string): Promise<any> {
        try {
            const userCollection = await database.collection(this.collectionName);
            return await userCollection.deleteOne({_id: database.getObjectId(userId)});
        } catch (e) {
            console.error(e);
            throw {message: 'user not deleted'};
        }
    }

    async getAllUsers(size?: number, skip?: number): Promise<any> {
        try {
            const userCollection = await database.collection(this.collectionName);
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
            const userCollection = await database.collection(this.collectionName);
            const user = await userCollection.findOne({_id: database.getObjectId(userId)});
            user.uid = user._id;
            delete user.password;
            return user;
        } catch (e) {
            console.error(e);
        }
    }

    async login(email: string, password: string): Promise<any> {
        try {
            const userCollection = await database.collection(this.collectionName);
            const user = await userCollection.findOne({email: email});
            if (!user) {
                throw 'User with that email not exist';
            }
            const passwordOk = await security.comparePassword(password, user.password);
            if (!passwordOk) {
                throw 'Password/Username is incorrect'
            }
            delete user.password;
            user.token = await security.generateToken({uid: user._id});
            user.uid = user._id;
            return user;
        } catch (e) {
            console.error(e);
            throw {message: 'Fails to login', reason: e.toString()}
        }
    }

    async updateUserDetails(userId: string, data: object): Promise<any> {
        try {
            const userCollection = await database.collection(this.collectionName);
            await userCollection.findOneAndUpdate({_id: database.getObjectId(userId)}, {
                $set: JSON.parse(JSON.stringify(data)),
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
            const userCollection = await database.collection(this.collectionName);
            const user = await userCollection.findOne({email: email});
            if (!user) {
                throw 'User record with that email not found';
            }
            const code = await security.generateToken({email: email});
            await userCollection.findOneAndUpdate({email: email}, {
                $set: {
                    resetCode: code
                }
            });
            await emailAdapter.sendEmail(email, 'jmshana@datavision.co.tz',
                'Password reset', `Use this code to reset your password, code:${code}`);
            return {message: 'Follow Instruction sent to email : ' + user.email};
        } catch (e) {
            console.error(e);
            throw {message: 'Fail to send reset password email', reason: e.toString()};
        }
    }

    async getRole(userId: string): Promise<string> {
        try {
            const userCollection = await database.collection(this.collectionName);
            const user = await userCollection.findOne({_id: database.getObjectId(userId)});
            if (!user) {
                throw 'no such user in records';
            }
            return user.role;
        } catch (e) {
            console.error(e);
            throw {message: 'user role can not be determined', reason: e.toString()}
        }
    }

    // todo: remove security, and add it in controller
    async resetPassword(email: string, code: string, password: string): Promise<any> {
        try {
            await security.verifyToken(code);
            const email = security.decodeToken(code);
            if (!password) {
                throw 'Please provide a new password';
            }
            if (email && email.email === email) {
                const hashedPassword = await security.encryptPassword(password);
                const userCollection = await database.collection(this.collectionName);
                await userCollection.findOneAndUpdate({email: email, resetCode: code}, {
                    $set: {
                        password: hashedPassword,
                        resetCode: null
                    }
                });
                await security.revokeToken(code);
                return 'Password updated';
            } else {
                throw 'code is invalid';
            }
        } catch (e) {
            throw {message: "Reset password fails", reason: e.toString()};
        }
    }

}
