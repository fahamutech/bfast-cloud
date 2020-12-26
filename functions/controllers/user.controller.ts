import {UserStoreFactory} from "../factories/user-store.factory.mjs";
import {SecurityFactory} from "../factories/security.factory.mjs";
import {UserModel} from "../models/user.model.mjs";
import {UsersStoreAdapter} from "../adapters/database.adapter";
import {SecurityAdapter} from "../adapters/security.adapter";
import {BfastConfig} from "../configs/bfast.config.mjs";

let userStore: UsersStoreAdapter;
let security: SecurityAdapter;

export class UserController {

    constructor(private  options: BfastConfig) {
        userStore = this.options.userStoreAdapter ?
            this.options.userStoreAdapter : new UserStoreFactory(this.options);
        security = this.options.securityAdapter ?
            this.options.securityAdapter : new SecurityFactory(this.options);
    }

    async createUser(user: UserModel): Promise<any> {
        return userStore.createUser(user);
    }

    async deleteUser(userId: string): Promise<any> {
        return userStore.deleteUser(userId);
    }

    async getAllUsers(size?: number, skip?: number): Promise<any[]> {
        return userStore.getAllUsers(size, skip);
    }

    async getRole(userId: string): Promise<any> {
        return userStore.getRole(userId);
    }

    async getUser(userId: string): Promise<UserModel> {
        return userStore.getUser(userId);
    }

    async login(username: string, password: string): Promise<any> {
        return userStore.login(username, password);
    }

    async logoutFromAllDevice(token: string): Promise<any> {
        try {
            return await security.revokeToken(token);
        } catch (e) {
            throw {message: 'Fails to log you out from all devices', reason: e.toString()};
        }
    }

    async requestResetPassword(email: string): Promise<any> {
        return userStore.requestResetPassword(email);
    }

    async resetPassword(code: string, password: string): Promise<any> {
        try {
            await userStore.resetPassword(code, password);
            await security.revokeToken(code);
            return 'Done reset password';
        } catch (e) {
            if (this.options.devMode) console.log(e);
            throw e;
        }
    }

    async updateUserDetails(userId: string, data: UserModel): Promise<any> {
        return userStore.updateUserDetails(userId, data);
    }

    async createAdmin(userModel: UserModel) {
        return userStore.createAdmin(userModel);
    }
}
