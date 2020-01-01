import {UserStoreFactory} from "../factory/UserStoreFactory";
import {Options} from "../config/Options";
import {UsersStoreAdapter} from "../adapter/database";
import {UserModel} from "../model/user";
import {SecurityAdapter} from "../adapter/security";
import {SecurityFactory} from "../factory/SecurityFactory";

export class UserController {
    private readonly userStore: UsersStoreAdapter;
    private readonly security: SecurityAdapter;

    constructor(private readonly options: Options) {
        this.userStore = this.options.userStoreAdapter ?
            this.options.userStoreAdapter : new UserStoreFactory(this.options);
        this.security = this.options.securityAdapter ?
            this.options.securityAdapter : new SecurityFactory(this.options);
    }

    async createUser(user: UserModel): Promise<any> {
        return this.userStore.createUser(user);
    }

    async deleteUser(userId: string): Promise<any> {
        return this.userStore.deleteUser(userId);
    }

    async getAllUsers(size?: number, skip?: number): Promise<any[]> {
        return this.userStore.getAllUsers(size, skip);
    }

    async getRole(userId: string): Promise<string> {
        return this.userStore.getRole(userId);
    }

    async getUser(userId: string): Promise<any> {
        return this.userStore.getUser(userId);
    }

    async login(username: string, password: string): Promise<any> {
        return this.userStore.login(username, password);
    }

    async logoutFromAllDevice(token: string): Promise<any> {
        try {
            return await this.security.revokeToken(token);
        } catch (e) {
            throw {message: 'Fails to log you out from all devices', reason: e.toString()};
        }
    }

    async requestResetPassword(email: string): Promise<any> {
        return this.userStore.requestResetPassword(email);
    }

    async resetPassword(email: string, code: string, password: string): Promise<any> {
        try{
            await this.userStore.resetPassword(email, code, password);
            await this.security.revokeToken(code);
        }catch (e) {
            if (this.options.devMode)console.log(e);
            throw e;
        }
    }

    async updateUserDetails(userId: string, data: object): Promise<any> {
        return this.userStore.updateUserDetails(userId, data);
    }
}
