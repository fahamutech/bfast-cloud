export interface BFastCloudSecurityAdapter {
    generateToken(data: object): Promise<string>;

    verifyToken(token: string): Promise<any>;

    decodeToken(token: string): any;

    encryptPassword(plainText: string): Promise<string>;

    comparePassword(plainPassword: string, hashPassword: string): Promise<boolean>;
}
