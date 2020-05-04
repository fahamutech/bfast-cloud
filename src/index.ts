#!/usr/bin/env node

import {BfastCloud} from "./bfast-cloud";

new BfastCloud({
    devMode: process.env.DEBUG === 'true',
    port: process.env.PORT ? process.env.PORT : '3000',
    masterKey: process.env.MASTER_KEY ? process.env.MASTER_KEY : 'qwertyuyttrwet7dfkgfger8966553333wt68746egckjegytgw79et9c7be',
    redisHOST: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'rdb',
    mongoURL: process.env.MONGO_URL ? process.env.MONGO_URL : 'mongodb://mdb:27017,mdbrs1:27017,mdbrs2:27017/_BFAST_ADMIN?replicaSet=bfastRS',
    mongoMasterURL: process.env.MONGO_MASTER_URL ? process.env.MONGO_MASTER_URL : 'mongodb://mdb:27017/_BFAST_ADMIN',
    dockerSocket: process.env.DOCKER_SOCKET ? process.env.DOCKER_SOCKET : '/usr/local/bin/docker'
});
