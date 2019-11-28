import {MongoClient} from "mongodb";
import {Configurations} from "./configurations";

export abstract class DatabaseConfigurations extends Configurations {
    private readonly mongoClient: MongoClient;
    DB_NAME = '_BFAST_ADMIN';
    collectionNames = {
        user: '_User',
        project: '_Project'
    };

    protected constructor() {
        super();
        if (this.DB_HOST === 'mdb') {
            this.mongoClient = new MongoClient(
                `mongodb://mdb:27017,mongodb://mdbrs1:27017,mongodb://mdbrs2:27017/${this.DB_NAME}?replicaSet=bfastRS`,
                {useNewUrlParser: true}
            );
        } else {
            this.mongoClient = new MongoClient(this.DB_HOST, {useNewUrlParser: true});
        }
    }

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

}
