import mongodb from "mongodb";

const {Db, Collection, MongoClient, ObjectID} = mongodb

let mongoClient;

export class DatabaseConfigFactory {

    /**
     *
     * @param mongoDbUrl {string}
     */
    constructor(mongoDbUrl) {
        mongoClient = new MongoClient(mongoDbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    /**
     *
     * @param collectionName {string}
     * @return {Promise<Collection>}
     */
    async collection(collectionName) {
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

    /**
     *
     * @param id {string}
     * @return {ObjectId}
     */
    getObjectId(id) {
        return new ObjectID(id);
    }

    /**
     *
     * @param name {string}
     * @return {Promise<Db>}
     */
    async getDatabase(name) {
        if (mongoClient.isConnected()) {
            return mongoClient.db(name);
        } else {
            const conn = await mongoClient.connect();
            return conn.db(name);
        }
    }

}
