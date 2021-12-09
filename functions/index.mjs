import bfast from "bfast";
import {initialize} from "bfast-database-core";
import {config} from "./options.mjs";

bfast.init({
    applicationId: config.applicationId,
    projectId: config.projectId,
    functionsURL: `http://localhost:${config.port}`,
    databaseURL: `http://localhost:${config.port}`,
    appPassword: config.masterKey
});

bfast.init({
    applicationId: 'fahamutaarifa',
    projectId: 'fahamutaarifa'
}, 'fahamutaarifa');

const bfastDatabaseWebService = initialize(config);
export const {rules} = bfastDatabaseWebService.rest();
// export const {jwk} = bfastDatabaseWebService.rest();
export const {changes} = bfastDatabaseWebService.realtime({
    applicationId: config.applicationId,
    masterKey: config.masterKey
});
export const {
    fileApi,
    fileListApi,
    fileListV2Api,
    fileUploadApi,
    fileUploadV2Api,
    fileV1Api,
    fileV2Api,
    fileThumbnailV2Api,
    fileThumbnailApi,
    getUploadFileV2
} = bfastDatabaseWebService.storage()
