export class UserModel {
    _id
    uid
    createdAt;
    updatedAt;
    role;
    email;
    mobile;
    displayName;
    password;
    phoneNumber;
    token;
}

export class UserRoles {
    static ADMIN_ROLE = 'ADMIN';
    static USER_ROLE = 'USER';
}
//
// // export interface SmartStockModel {
// //     name: string;
// //     country: string;
// //     state: string;
// //     street: string;
// // }
