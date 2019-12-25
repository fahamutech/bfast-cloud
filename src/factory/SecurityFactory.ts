import {BFastCloudSecurityAdapter} from "../adapters/security";
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export class BFastSecurity implements BFastCloudSecurityAdapter {
    private jwtPassword = `MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFg6797ocIzEPK
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

    generateToken(data: object): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(data, this.jwtPassword, {
                expiresIn: '360d',
                issuer: 'bfast::cloud'
            }, (err, encoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(encoded);
                }
            });
        })
    }

    verifyToken(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                jwt.verify(token, this.jwtPassword, {
                    issuer: 'bfast::cloud',
                }, (err, decoded) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded);
                    }
                })
            } catch (e) {
                console.error(e);
                reject(e.toString());
            }
        });
    }

    decodeToken(token: string): any {
        return jwt.decode(token, {
            complete: true,
            json: true
        });
    }

}
