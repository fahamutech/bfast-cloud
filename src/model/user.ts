export interface UserModel {
    uid?: string
    createdAt?: any;
    updatedAt?: any;
    role: string;
    email: string;
    displayName: string;
    password: string;
    phoneNumber: string;
    token?: string;
}

export class UserRoles {
    static ADMIN_ROLE: string = 'ADMIN';
    static USER_ROLE: string = 'USER';
}
