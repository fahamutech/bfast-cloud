import {DatabaseAdapter} from "../adapter/database";
import {Collection, Db, MongoClient, ObjectID} from "mongodb";
import {BFastOptions} from "../config/BFastOptions";

let mongoClient: MongoClient;

export class DatabaseConfigFactory implements DatabaseAdapter {

    constructor(private  options: BFastOptions) {
        mongoClient = new MongoClient(this.options.mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    async collection(collectionName: string): Promise<Collection> {
        try {
            if (mongoClient.isConnected()) {
                return mongoClient.db().collection(collectionName);
            } else {
                const conn = await mongoClient.connect();
                return conn.db().collection(collectionName);
            }
        } catch (e) {
            // console.log(e);
            throw {message: 'Fails to get collection', reason: e.toString()};
        }
    }

    getObjectId(id: string): ObjectID {
        return new ObjectID(id);
    }

    async getDatabase(name: string): Promise<Db> {
        if (mongoClient.isConnected()) {
            return mongoClient.db(name);
        } else {
            const conn = await mongoClient.connect();
            return conn.db(name);
        }
    }

}
