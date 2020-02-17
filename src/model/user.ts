export interface UserModel {
    _id?: any
    uid?: any
    createdAt?: any;
    updatedAt?: any;
    role: string;
    email: string;
    mobile: string;
    displayName: string;
    password: string;
    phoneNumber: string;
    token?: string;
}

export class UserRoles {
    static ADMIN_ROLE: string = 'ADMIN';
    static USER_ROLE: string = 'USER';
}

// export interface SmartStockModel {
//     name: string;
//     country: string;
//     state: string;
//     street: string;
// }
