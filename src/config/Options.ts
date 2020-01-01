import {RestServerAdapter, RouterGuardAdapter} from "../adapter/rest";
import {DatabaseAdapter, ProjectStoreAdapter, UsersStoreAdapter} from "../adapter/database";
import {ShellAdapter} from "../adapter/shell";
import {ResourcesAdapter} from "../adapter/resources";
import {SecurityAdapter} from "../adapter/security";
import {EmailAdapter} from "../adapter/email";
import {ContainerOrchestrationAdapter} from "../adapter/containerOrchestration";

export interface Options {
    mongoURL: string;
    redisURL: string;
    devMode: boolean;
    dockerSocket: string;
    port: string;
    restServerAdapter?: RestServerAdapter;
    databaseConfigAdapter?: DatabaseAdapter;
    projectStoreAdapter?: ProjectStoreAdapter;
    userStoreAdapter?: UsersStoreAdapter;
    shellAdapter?: ShellAdapter;
    resourcesAdapter?: ResourcesAdapter;
    securityAdapter?: SecurityAdapter;
    emailAdapter?: EmailAdapter;
    containerOrchAdapter?: ContainerOrchestrationAdapter;
    routerGuard?: RouterGuardAdapter;
}
