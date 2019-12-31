import {RestAdapter} from "../adapters/rest";
import {DatabaseConfigAdapter} from "../adapters/database";

export interface Options {
    mongoURL: string;
    redisURL: string;
    production: boolean;
    dockerSocket: string;
    port: string;
    RESTAdapter?: RestAdapter;
    databaseConfigAdapter?: DatabaseConfigAdapter;
}


// export const Options = {
//     mongoURL: function (url: string) {
//         if (url) {
//             return url;
//         } else {
//             return process.env.MONGO_URL || 'mdb';
//         }
//     },
//     redisURL: function (url: string) {
//         if (url) {
//             return url;
//         } else {
//             return process.env.REDIS_URL || 'redis';
//         }
//     },
//     debug: function (b: string): boolean {
//         if (b) {
//             return Boolean(b);
//         } else {
//             if (process.env.DEBUG) {
//                 return Boolean(process.env.DEBUG);
//             } else {
//                 return false;
//             }
//         }
//     },
//     dockerSocket: function (dockerPath: string): string {
//         if (dockerPath) {
//             return dockerPath;
//         } else {
//             return process.env.DOCKER_SOCKET || '/usr/local/bin/docker';
//         }
//     },
//
// };
//

