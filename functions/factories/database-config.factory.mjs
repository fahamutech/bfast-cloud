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
        const mongoClient = new MongoClient(this.mongoDbUrl);
        return mongoClient.connect();
    }

    /**
     *
     * @param name {string}
     * @return {Promise<Db>}
     */
    async getDatabase(name) {
        const conn = await this.connect();
        return conn.db(name);
    }

}
