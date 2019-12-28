import {Collection, MongoClient, ObjectID} from "mongodb";
import {Configurations} from "./configurations";
import {Options} from "./Options";

export abstract class DatabaseConfigurations extends Configurations {
    private readonly mongoClient: MongoClient;
    DB_NAME = '_BFAST_ADMIN';
    collectionNames = {
        user: '_User',
        project: '_Project',
    };

    protected constructor(options: Options) {
        super(options);
        if (this.DB_HOST === 'mdb') {
            this.mongoClient = new MongoClient(
                `mongodb://mdb:27017,mdbrs1:27017,mdbrs2:27017/${this.DB_NAME}?replicaSet=bfastRS`,
                {useNewUrlParser: true, useUnifiedTopology: true}
            );
        } else {
            this.mongoClient = new MongoClient(this.DB_HOST, {useNewUrlParser: true, useUnifiedTopology: true});
        }
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

    async getCollection(collectionName: string): Promise<Collection> {
        try {
            if (this.mongoClient.isConnected()) {
                return this.mongoClient.db(this.DB_NAME).collection(collectionName);
            } else {
                const conn = await this.mongoClient.connect();
                return conn.db(this.DB_NAME).collection(collectionName);
            }
        } catch (e) {
            console.log(e);
            throw {message: 'can not get collection', reason: e.toString()};
        }
    }

    convertToObjectId(id: string): ObjectID {
        return new ObjectID(id)
    }

    // will be removed in future
    initiateRs() {
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

    // getComposeFile(filename: string): string {
    //     return "";
    // }

}
