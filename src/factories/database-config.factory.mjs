import mongodb from "mongodb";

const {Db, Collection, MongoClient} = mongodb

export class DatabaseConfigFactory {

    /**
     *
     * @param databaseURI {string}
     */
    constructor(databaseURI) {
        this.databaseURI = databaseURI;

    }

    /**
     *
     * @return {Promise<MongoClient>}
     */
    async connect() {
        return new MongoClient(this.databaseURI).connect();
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
