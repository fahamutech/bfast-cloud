import {ShellAdapter} from "../adapters/shell.adapter";
import {DatabaseAdapter, ProjectStoreAdapter, UsersStoreAdapter} from "../adapters/database.adapter";
import {SecurityAdapter} from "../adapters/security.adapter";
import {RestServerAdapter, RouterGuardAdapter} from "../adapters/rest.adapter";
import {EmailAdapter} from "../adapters/email.adapter";
import {ResourcesAdapter} from "../adapters/resources.adapter";
import {OrchestrationAdapter} from "../adapters/orchestration.adapter";

export interface BfastConfig {
    mongoURL: string;
    redisHOST: string;
    devMode: boolean;
    dockerSocket: string;
    port: string;
    masterKey: string;
    restServerAdapter?: RestServerAdapter;
    databaseConfigAdapter?: DatabaseAdapter;
    projectStoreAdapter?: ProjectStoreAdapter;
    userStoreAdapter?: UsersStoreAdapter;
    shellAdapter?: ShellAdapter;
    resourcesAdapter?: ResourcesAdapter;
    securityAdapter?: SecurityAdapter;
    emailAdapter?: EmailAdapter;
    containerOrchAdapter?: OrchestrationAdapter;
    routerGuard?: RouterGuardAdapter;
}
