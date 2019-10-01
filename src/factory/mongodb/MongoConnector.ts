import {MongoClient} from "mongodb";

export abstract class MongoConnector {
    private readonly mongoClient: MongoClient;
    private readonly DB_HOST: string;
    private readonly isDebug: string;
    DB_NAME = '_BFAST_ADMIN';
    collectionNames = {
        user: '_User',
        project: '_Project'
    };

    constructor() {
        this.isDebug = process.env.debug || "false";
        this.DB_HOST = process.env.mdbhost || 'mdb';
        this.mongoClient = new MongoClient(`mongodb://${this.DB_HOST}:27017/${this.DB_NAME}`, {useNewUrlParser: true});
        this._initiateRs();
    }

    getConnection(): Promise<MongoClient> {
        return new Promise(async (resolve, reject) => {
            if (this.mongoClient.isConnected()) {
                return this.mongoClient;
            } else {
                return await this.mongoClient.connect();
            }
        })
    }

    private _initiateRs() {
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
