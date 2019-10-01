import {MongoProjectDatabase} from "../factory/mongodb/MongoProjectDatabase";

export class DatabaseController extends MongoProjectDatabase {
    constructor() {
        super()
    }

    // createUser(data: any) {
    //     if (collection && data) {
    //         mongoClient.connect().then((conn: any) => {
    //             conn.db(DB_NAME).collection(DB_COLL.user).insertOne(data)
    //         }).catch((reason: any) => {
    //             return Promise.reject(reason);
    //         })
    //     } else {
    //         return Promise.reject({message: 'Please provide enough information'});
    //     }
    // }

}

