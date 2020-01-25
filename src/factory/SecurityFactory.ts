import {SecurityAdapter} from "../adapter/security";
import * as bcrypt from 'bcrypt';
import * as redis from 'redis';
import {RedisClient} from 'redis';
import * as _jwt from 'jsonwebtoken';
import {Options} from "../config/Options";

let _jwtPassword =
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
let _redisClient: RedisClient;

export class SecurityFactory implements SecurityAdapter {

    constructor(private  options: Options) {
        if (this.options.devMode) {
            try {
                const redisMock = require('redis-mock'); // this must ne removed and to pass only a redis url
                _redisClient = redisMock.createClient();
                // console.log(_redisClient);
            } catch (e) {
                console.log('fail to set mock redis')
            }
        } else {
            _redisClient = redis.createClient({
                host: options.redisHOST,
            });
        }
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
        return new Promise((resolve, reject) => {
            _redisClient.del(token, (err, reply) => {
                if (err || !reply) {
                    reject({
                        message: 'Fails to revoke a token',
                        reason: err !== null ? err.toString() : 'unknown reason'
                    });
                    return;
                }
                resolve({message: 'Token revoked', value: reply});
            });
        });
    }

    async generateToken(data: { [key: string]: any; }, expire?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            _jwt.sign(data, _jwtPassword, {
                expiresIn: expire ? expire : '360d',
                issuer: 'bfast::cloud'
            }, (err, encoded) => {
                if (err) {
                    reject({message: 'Fails to generate a token', reason: err.toString()});
                    return;
                }
                _redisClient.set(encoded, JSON.stringify(data), (err1, reply) => {
                    if (err1) {
                        reject({message: 'Fails to cache your token', reason: err1.toString()});
                        return;
                    }
                    resolve(encoded);
                });
                _redisClient.expire(encoded, 360 * 86400);
            });
        });
    }

    async verifyToken(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            _jwt.verify(token, _jwtPassword, {
                issuer: 'bfast::cloud'
            }, (err, decoded: any) => {
                if (err) {
                    reject({message: 'Fails to verify token', reason: err.toString()});
                    return;
                }
                _redisClient.get(token, (err1, reply) => {
                    if (err1) {
                        reject({message: 'Token revoked', reason: err1.toString()});
                        return;
                    }

                    if (!reply) {
                        reject({message: 'Token revoked', reason: 'token not cached'});
                        return;
                    }

                    const data = JSON.parse(reply);
                    let validEmail = false;
                    let validUid = false;
                    if (data && data.email && decoded && data.email === decoded.email) {
                        validEmail = true;
                    }
                    if (data && data.uid && decoded && data.uid === decoded.uid) {
                        validUid = true;
                    }
                    if (validEmail || validUid) {
                        resolve(decoded);
                    } else {
                        reject({message: 'Token revoked', reason: 'token tempered'});
                    }
                });
            });
        });
    }

    decodeToken(token: string): any {
        return _jwt.decode(token, {
            complete: true,
            json: true
        });
    }

}
