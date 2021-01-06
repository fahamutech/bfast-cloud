import bcryptjs from 'bcryptjs';
import redis from 'redis';
import _jwt from 'jsonwebtoken';

const {compare, hash} = bcryptjs;
const {RedisClient} = redis;
// const {decode, sign} = jsonwebtoken;

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

export class SecurityFactory {

    /**
     *
     * @param redisDbUrl {string}
     */
    constructor(redisDbUrl) {
        this._redisClient = new RedisClient({
            host: redisDbUrl,
        });
    }

    /**
     *
     * @param plainPassword {string}
     * @param hashPassword {string}
     * @return {Promise<boolean>}
     */
    async comparePassword(plainPassword, hashPassword) {
        return await compare(plainPassword, hashPassword);
    }

    /**
     *
     * @param plainText {string}
     * @return {Promise<string>}
     */
    async encryptPassword(plainText) {
        return await hash(plainText, 5);
    }

    /**
     *
     * @param token {string}
     * @return {Promise<*>}
     */
    async revokeToken(token) {
        return new Promise((resolve, reject) => {
            this._redisClient.del(token, (err, reply) => {
                if (err) {
                    reject({
                        message: 'Fails to revoke a token',
                        reason: err.toString()
                    });
                    return;
                }
                resolve({message: 'Token revoked', value: reply});
            });
        });
    }

    /**
     *
     * @param data {{[p: string]: any}}
     * @param expire {string}
     * @return {Promise<string>}
     */
    async generateToken(data, expire = '7d') {
        return new Promise((resolve, reject) => {
            _jwt.sign(data, _jwtPassword, {
                expiresIn: expire ? expire : '7d',
                issuer: 'bfast::cloud'
            }, (err, encoded) => {
                if (err) {
                    reject({message: 'Fails to generate a token', reason: err.toString()});
                    return;
                }
                this._redisClient.set(encoded, JSON.stringify(data), (err1, reply) => {
                    if (err1) {
                        reject({message: 'Fails to cache your token', reason: err1.toString()});
                        return;
                    }
                    resolve(encoded);
                });
                this._redisClient.expire(encoded, expire && expire !== '' ?
                    parseInt(expire.replace('d', '')) * 86400 : 7 * 86400);
            });
        });
    }

    /**
     *
     * @param token {string}
     * @return {Promise<*>}
     */
    async verifyToken(token) {
        return new Promise((resolve, reject) => {
            _jwt.verify(token, _jwtPassword, {
                issuer: 'bfast::cloud'
            }, (err, decoded) => {
                if (err) {
                    reject({message: 'Fails to verify token', reason: err.toString()});
                    return;
                }
                this._redisClient.get(token, (err1, reply) => {
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

    /**
     *
     * @param token {string}
     * @return {{[p: string]: *}}
     */
    decodeToken(token) {
        return _jwt.decode(token, {
            complete: true,
            json: true
        });
    }

}