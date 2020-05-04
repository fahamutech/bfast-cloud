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

    // will be removed in future
    async initiateReplicaSet() {
        const _mongoClientRS: MongoClient = new MongoClient(this.options.mongoMasterURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        let _connectionToRS = await _mongoClientRS.connect();
        try {
            const repInterval = setInterval(
                async () => {
                    console.log('************initiate replica set******************');
                    try {
                        console.log('start to connect');
                        console.log('start to call master');
                        const isM = await _connectionToRS.db().executeDbAdminCommand({isMaster: 1});
                        if (isM && isM.ismaster) {
                            console.log('master exist');
                            try {
                                await _connectionToRS.db().executeDbAdminCommand({
                                    replSetReconfig: {
                                        host: "mdbrs1",
                                        priority: 0,
                                        votes: 0
                                    }
                                });
                                await _connectionToRS.db().executeDbAdminCommand({
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
                            await _connectionToRS.db().executeDbAdminCommand({
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
                        await _connectionToRS.close();
                        clearInterval(repInterval);
                        return;
                    } catch (e) {
                        console.log(e);
                    }
                },
                10000
            );
        } catch (reason) {
            console.log(reason)
        }
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
