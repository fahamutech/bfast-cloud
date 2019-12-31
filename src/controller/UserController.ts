import {UserStoreFactory} from "../factory/UserStoreFactory";
import {Options} from "../config/Options";
import {UsersStoreAdapter} from "../adapters/database";

export class UserController {
    private readonly userStore: UsersStoreAdapter;

    constructor(private readonly options: Options) {
        this.userStore = this.options.userStoreAdapter ?
            this.options.userStoreAdapter : new UserStoreFactory(this.options);
    }
}
