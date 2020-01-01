import {SecurityAdapter} from "../adapter/security";
import * as bcrypt from 'bcrypt';
import JWTRedis from "jwt-redis";
import * as redis from 'redis';
import {Options} from "../config/Options";

const redisMock = require('redis-mock');

let jwtPassword =
    `MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFg6797ocIzEPK
mk96COGGqySke+nVcJwNvuGqynxvahg6OFHamg29P9S5Ji73O1t+3uEhubv7lbaF
f6WA1xnLzPSa3y3OdkFDUt8Px0SwnSJRxgNVG2g4gT6pA/huuJDuyleTPUKAqe/4
Ty/jbmj+dco+nTXzxo2VDB/uCGUTibPE7TvuAG3O5QbYVM2GBEPntha8L3IQ9GKc
0r+070xbqPRL5mKokySTm6FbCT2hucL4YlOWAfkdCYJp64up8THbsMBi1e9mUgwl
8etXcs2z0UybQSQzA4REy+3qmIIvZ3m9xLsNGAVcJ7aXkfPSajkYvvVJFXmz35Nh
bzrJW7JZAgMBAAECggEABAX9r5CHUaePjfX8vnil129vDKa1ibKEi0cjI66CQGbB
3ZW+HRzcQMmnFKpxdHnSEFCL93roGGThVfDWtzwqe1tOdEUtkrIX/D4Y6yJdBNf+
lfnZoYcwZU5Er360NdUupp6akBZEX4iWqdE7IX/jRaOynfnn2nJl+e5ITDoBjRdM
yZcg4fhWMw9NGoiv21R1oBX5TibPE7TvuAG3O5QbYVM2GBEPntha8L3IQ9GKc
0r+070xbqPRL5mKokySTm6FbCT2hucL4YlOWAfkdCYJp64up8THbsMBi1e9mUgwl
8etXcs2z0UybQSQzA4REy+3qmIIvZ3m9xLsNGAVcJ7aXkfPSajkYvvVJFXmz35Nh
bzrJW7JZAgMBAAECggEABAX9r5CHUaePjfX8vnil129vDKa1ibKEi0cjI66CQGbB
3ZW+HRzcQMmnFKpxdHnSiruupq+MwnYoSvDv21hfCfkQDXvppQkXe72S+oS2vrJr
JLcWQ6hFDpecIaaCJiqAXvFACr`;
let jwt: JWTRedis;

export class SecurityFactory implements SecurityAdapter {

    constructor(private  options: Options) {
        let redisClient;
        if (this.options.devMode) {
            redisClient = redisMock.createClient();
            // console.log(redisClient.host);
        } else {
            redisClient = redis.createClient({
                host: options.redisURL,
            });
        }
        jwt = new JWTRedis(redisClient);
    }

    async comparePassword(plainPassword: string, hashPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(plainPassword, hashPassword);
        } catch (e) {
            console.error(e);
            throw e.toString();
        }
    }

    async encryptPassword(plainText: string): Promise<string> {
        try {
            return await bcrypt.hash(plainText, 5);
        } catch (e) {
            console.error(e);
            throw e.toString();
        }
    }

    async revokeToken(token: string): Promise<any> {
        try {
            return await jwt.destroy(token);
        } catch (e) {
            throw {message: "Fails to destroy a token", reason: e.toString()};
        }
    }

    async generateToken(data: { [key: string]: any; }, expire?: string): Promise<string> {
        try {
            return await jwt.sign(data, jwtPassword, {
                expiresIn: expire ? expire : '360d',
                issuer: 'bfast::cloud'
            });
        } catch (e) {
            throw {message: 'Fails to generate a token', reason: e.toString()};
        }
    }

    async verifyToken(token: string): Promise<any> {
        try {
            return await jwt.verify(token, jwtPassword, {
                issuer: 'bfast::cloud'
            });
        } catch (e) {
            throw {message: 'Fails to verify token', reason: e.toString()};
        }
    }

    decodeToken(token: string): any {
        return jwt.decode(token, {
            complete: true,
            json: true
        });
    }

}
