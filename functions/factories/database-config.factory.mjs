import mongodb from "mongodb";
import mongoUrlParse from 'mongo-url-parser';

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

        let mongoUri;
        const parsed = mongoUrlParse(this.mongoDbUrl);
        if (parsed.auth) {
            mongoUri = `mongodb://${parsed.auth.user}:${parsed.auth.password}@139.162.206.182:27017/${parsed.dbName}?authSource=admin`
        } else {
            mongoUri = `mongodb://localhost:27017/${parsed.dbName}`
        }
        // console.log(mongoUri,'--------------->>>>>>>');
        return new MongoClient(mongoUri).connect();
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
