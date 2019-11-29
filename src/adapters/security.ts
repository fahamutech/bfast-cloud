export interface BFastCloudSecurityAdapter {
    generateToken(data: any): Promise<string>;

    verifyToken(token: string): Promise<any>;

    encryptPassword(plainText: string): Promise<string>;

    comparePassword(plainPassword: string, hashPassword: string): Promise<boolean>;
}
