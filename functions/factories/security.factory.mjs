import bcryptjs from 'bcryptjs';
import _jwt from 'jsonwebtoken';
import keypairs from "keypairs";

const {compare, hash} = bcryptjs;

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
     */
    constructor() {
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
        // const d = await this.verifyToken(token);
        // await bfast.database()
        //     .table('_Token')
        //     .query()
        //     .byId(d.uid)
        //     .updateBuilder()
        //     .upsert(true)
        //     .set('valid', 'not')
        //     .update({useMasterKey: true});
        return {message: 'Token revoked'};
    }

    /**
     *
     * @param data {object}
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
                // bfast.database()
                //     .table('_Token')
                //     .query()
                //     .byId(data?.uid)
                //     .updateBuilder()
                //     .upsert(true)
                //     .set('valid', 'ok')
                //     .update({useMasterKey: true})
                //     .finally(_ => {
                resolve(encoded);
                // });
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
                // bfast.database()
                //     .table('_Token')
                //     .get(decoded.uid, null, {useMasterKey: true})
                //     .then(value => {
                //         if (value.valid === 'ok') {
                resolve(decoded);
                //         } else {
                //             reject({message: 'Token revoked'});
                //         }
                //     }).catch(err => {
                //     reject(err);
                // });
            });
        });
    }

    /**
     *
     * @return {{private: object, public: object}}
     */
    generateRsaPair() {
        return keypairs.generate({kty: 'RSA', modulusLength: 2048});
    }

}
