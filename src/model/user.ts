export interface UserModel {
    uid?: string
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

export interface BusinessModel {
    name: string;
    country: string;
    state: string;
    street: string;
}
