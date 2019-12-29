export interface SecurityAdapter {
    generateToken(data: { [key: string]: any; }, expire?: string): Promise<string>;

    verifyToken(token: string): Promise<any>;

    decodeToken(token: string): any;

    revokeToken(token: string): Promise<any>;

    encryptPassword(plainText: string): Promise<string>;

    comparePassword(plainPassword: string, hashPassword: string): Promise<boolean>;
}
