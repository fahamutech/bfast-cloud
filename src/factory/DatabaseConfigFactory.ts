import {DatabaseAdapter} from "../adapters/database";
import {Collection, MongoClient, ObjectID} from "mongodb";
import {Options} from "../config/Options";

export class DatabaseConfigFactory implements DatabaseAdapter {
    private readonly mongoClient: MongoClient;
    // DB_NAME = '_BFAST_ADMIN';
    //  collectionNames = {
    //      user: '_User',
    //      project: '_Project',
    //  };

    constructor(private readonly options: Options) {
        // `mongodb://mdb:27017,mdbrs1:27017,mdbrs2:27017/${this.DB_NAME}?replicaSet=bfastRS`
        this.mongoClient = new MongoClient(this.options.mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    /**
     * @deprecated since v0.3.3 and will be removed in v0.4.0 use this#getCollection instead
     * to get a collection ready to be consumed
     */
    getConnection(): Promise<MongoClient> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.mongoClient.isConnected()) {
                    resolve(this.mongoClient);
                } else {
                    resolve(this.mongoClient.connect());
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    async collection(collectionName: string): Promise<Collection> {
        try {
            if (this.mongoClient.isConnected()) {
                return this.mongoClient.db().collection(collectionName);
            } else {
                const conn = await this.mongoClient.connect();
                return conn.db().collection(collectionName);
            }
        } catch (e) {
            console.log(e);
            throw {message: 'Fails to get collection', reason: e.toString()};
        }
    }

    // async table(tableName: string): Promise<Collection> {
    //     return this.collection(tableName);
    // }

    getObjectId(id: string): ObjectID {
        return new ObjectID(id);
    }

    // will be removed in future
    initiateReplicaSet() {
        try {
            const repInterval = setInterval(async () => {
                console.log('************initiate replica set******************');
                try {
                    console.log('start to connect');
                    let conn = await this.getConnection();
                    console.log('start to call master');
                    const isM = await conn.db().executeDbAdminCommand({isMaster: 1});
                    if (isM && isM.ismaster) {
                        console.log('master exist');
                        try {
                            await conn.db().executeDbAdminCommand({
                                replSetReconfig: {
                                    host: "mdbrs1",
                                    priority: 0,
                                    votes: 0
                                }
                            });
                            await conn.db().executeDbAdminCommand({
                                replSetReconfig: {
                                    host: "mdbrs2",
                                    priority: 0,
                                    votes: 0
                                }
                            });
                        } catch (r1) {
                            console.log(r1);
                        }
                    } else {
                        console.log('master not exist');
                        await conn.db().executeDbAdminCommand({
                            replSetInitiate: {
                                "_id": "bfastRS",
                                "members": [
                                    {"_id": 0, host: "mdb"},
                                    {"_id": 1, host: "mdbrs1", priority: 0, votes: 0},
                                    {"_id": 2, host: "mdbrs2", priority: 0, votes: 0}
                                ]
                            }
                        });
                    }
                    console.log('=======>>>>>done initiate replica set');
                    clearInterval(repInterval);
                    return;
                } catch (e) {
                    console.log(e);
                }
            }, 10000);
        } catch (reason) {
            console.log(reason)
        }
    }

}
