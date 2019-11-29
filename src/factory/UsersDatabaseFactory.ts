import {DatabaseConfigurations} from "../config/mdbConfigurations";
import {UsersDatabaseAdapter} from "../adapters/database";
import {UserModel, UserRoles} from "../model/user";
import {BFastCloudSecurityAdapter} from "../adapters/security";
import {EmailAdapter} from "../adapters/email";

export class UsersDatabaseFactory extends DatabaseConfigurations implements UsersDatabaseAdapter {
    USER_COLL = this.collectionNames.user;

    constructor(private readonly securityAdapter: BFastCloudSecurityAdapter,
                private readonly emailAdapter: EmailAdapter) {
        super();
    }

    async createUser(user: UserModel): Promise<any> {
        try {
            delete user.uid;
            user.createdAt = Date.now();
            user.password = await this.securityAdapter.encryptPassword(user.password);
            user.role = UserRoles.USER_ROLE;
            const userCollection = await this.getCollection(this.USER_COLL);
            const insertUser = await userCollection.insertOne(user);
            const indexExist = await userCollection.indexExists('email');
            if (!indexExist) {
                await userCollection.createIndex({email: 1}, {unique: true});
            }
            user.uid = insertUser.insertedId as string;
            delete user.password;
            user.token = await this.securityAdapter.generateToken({uid: insertUser.insertedId as string});
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
            const userCollection = await this.getCollection(this.USER_COLL);
            return await userCollection.deleteOne({_id: this.convertToObjectId(userId)});
        } catch (e) {
            console.error(e);
            throw {message: 'user not deleted'};
        }
    }

    async getAllUsers(size?: number, skip?: number): Promise<any> {
        try {
            const userCollection = await this.getCollection(this.USER_COLL);
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
            const userCollection = await this.getCollection(this.USER_COLL);
            const user = await userCollection.findOne({_id: this.convertToObjectId(userId)});
            user.uid = user._id;
            delete user.password;
            return user;
        } catch (e) {
            console.error(e);
        }
    }

    async login(email: string, password: string): Promise<any> {
        try {
            const userCollection = await this.getCollection(this.USER_COLL);
            const user = await userCollection.findOne({email: email});
            if (!user) {
                throw 'User with that email not exist';
            }
            const passwordOk = await this.securityAdapter.comparePassword(password, user.password);
            if (!passwordOk) {
                throw 'Password/Username is incorrect'
            }
            delete user.password;
            user.token = await this.securityAdapter.generateToken({uid: user._id});
            user.uid = user._id;
            return user;
        } catch (e) {
            console.error(e);
            throw {message: 'Fails to login', reason: e.toString()}
        }
    }

    async updateUserDetails(userId: string, data: object): Promise<any> {
        try {
            const userCollection = await this.getCollection(this.USER_COLL);
            const result = await userCollection.findOneAndUpdate({_id: this.convertToObjectId(userId)}, {
                $set: JSON.parse(JSON.stringify(data)),
            });
            return await this.getUser(userId);
        } catch (e) {
            console.error(e);
            throw {message: 'fail to update user details', reason: e.toString()}
        }
    }

    // need to ne implemented
    async resetPassword(email: string): Promise<any> {
        try {
            const userCollection = await this.getCollection(this.USER_COLL);
            const user = await userCollection.findOne({email: email});
            if (!user) {
                throw 'User record with that email not found';
            }
            await this.emailAdapter.sendEmail('', '', `check your email`);
            return {message: 'Follow Instruction sent to email : ' + user.email};
        } catch (e) {
            console.error(e);
            throw {message: 'fail to send reset password email', reason: e.toString()}
        }
    }

    async getRole(userId: string): Promise<string> {
        try {
            const userCollection = await this.getCollection(this.USER_COLL);
            const user = await userCollection.findOne({_id: this.convertToObjectId(userId)});
            if (!user) {
                throw 'no such user in records';
            }
            return user.role;
        } catch (e) {
            console.error(e);
            throw {message: 'user role can not be determined', reason: e.toString()}
        }
    }

}
