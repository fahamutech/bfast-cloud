import {BFastCloudSecurityAdapter} from "../adapters/security";

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

export class BFastSecurity implements BFastCloudSecurityAdapter {

    comparePassword(plainPassword: string, hashPassword: string): Promise<boolean> {
       // jwt
        return undefined;
    }

    encryptPassword(plainText: string): Promise<string> {
        return undefined;
    }

    generateToken(data: any): Promise<string> {
        return undefined;
    }

    verifyToken(token: string): Promise<any> {
        return undefined;
    }

}
