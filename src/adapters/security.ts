export interface SecurityAdapter {
    generateToken(data: { [key: string]: any; }): Promise<string>;

    verifyToken(token: string): Promise<any>;

    decodeToken(token: string): any;

    encryptPassword(plainText: string): Promise<string>;

    comparePassword(plainPassword: string, hashPassword: string): Promise<boolean>;
}
