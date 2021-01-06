import mongodb from "mongodb";

const {Db, Collection, MongoClient} = mongodb

export class DatabaseConfigFactory {

    /**
     *
     * @param mongoDbUrl {string}
     */
    constructor(mongoDbUrl) {
        this.mongoDbUrl = mongoDbUrl;

    }

    /**
     *
     * @return {Promise<MongoClient>}
     */
    async connect() {
        const mongoClient = new MongoClient(this.mongoDbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        return mongoClient.connect();
    }

    disconnect() {
        // if (mongoClient && mongoClient.isConnected()) {
        //     mongoClient.close().catch(_ => {
        //     });
        // }
    }


    /**
     *
     * @param collectionName {string}
     * @return {Promise<Collection>}
     * @deprecated initialise collection manually so you can close connection after use
     */
    async collection(collectionName) {
        const connection = await this.connect();
        return connection.db().collection(collectionName);
        // try {
        //     if (mongoClient.isConnected()) {
        //         return mongoClient.db().collection(collectionName);
        //     } else {
        //         const conn = await this.connect();
        //         return conn.db().collection(collectionName);
        //     }
        // } catch (e) {
        //     throw {message: 'Fails to get collection', reason: e.toString()};
        // }
    }

    /**
     *
     * @param tasks {Function}
     * @return {Promise<void>}
     */
    async transaction(tasks) {
        const _mongoClient = await this.connect();
        let session;
        try {
            const transactionOptions = {
                readPreference: 'primary',
                readConcern: {level: 'local'},
                writeConcern: {w: 'majority'}
            };
            session = _mongoClient.startSession();
            await session.withTransaction(async session1 => {
                await tasks(session1, _mongoClient);
            }, transactionOptions);
        } finally {
            if (session) {
                session.endSession().catch(_ => {
                });
            }
            _mongoClient.close().catch(_ => {
            });
        }
    }

    /**
     *
     * @param id {string}
     * @return {string}
     */
    getObjectId(id) {
        // return new ObjectID(id);
        return id;
    }

    /**
     *
     * @param name {string}
     * @return {Promise<Db>}
     */
    async getDatabase(name) {
        // if (mongoClient.isConnected()) {
        //     return mongoClient.db(name);
        // } else {
        const conn = await this.connect();
        return conn.db(name);
        // }
    }

}
