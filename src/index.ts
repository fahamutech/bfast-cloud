#!/usr/bin/env node

import {BfastCloud} from "./bfast-cloud";

new BfastCloud({
    devMode: Boolean(process.env.DEBUG)
        || false,
    port: process.env.PORT
        || '3000',
    masterKey: process.env.MASTER_KEY
        || 'qwertyuyttrwet7dfkgfger8966553333wt68746egckjegytgw79et9c7be',
    redisURL: process.env.REDIS_URL
        || 'redis://rdb',
    mongoURL: process.env.MONGO_URL
        || 'mongodb://mdb:27017,mdbrs1:27017,mdbrs2:27017/_BFAST_ADMIN?replicaSet=bfastRS',
    dockerSocket: process.env.DOCKER_SOCKET
        || '/usr/local/bin/docker'
});
