import {RestAdapter, RouterGuardAdapter} from "../adapters/rest";
import {DatabaseAdapter, ProjectStoreAdapter, UsersStoreAdapter} from "../adapters/database";
import {ShellAdapter} from "../adapters/shell";
import {ResourcesAdapter} from "../adapters/resources";
import {SecurityAdapter} from "../adapters/security";
import {EmailAdapter} from "../adapters/email";
import {ContainerOrchestrationAdapter} from "../adapters/containerOrchestration";

export interface Options {
    mongoURL: string;
    redisURL: string;
    production: boolean;
    dockerSocket: string;
    port: string;
    RESTAdapter?: RestAdapter;
    databaseConfigAdapter?: DatabaseAdapter;
    projectStoreAdapter?: ProjectStoreAdapter;
    userStoreAdapter?: UsersStoreAdapter;
    shellAdapter?: ShellAdapter;
    resourcesAdapter?: ResourcesAdapter;
    securityAdapter?: SecurityAdapter;
    emailAdapter?: EmailAdapter;
    containerOrchAdapter?: ContainerOrchestrationAdapter;
    routerGuard: RouterGuardAdapter;
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

