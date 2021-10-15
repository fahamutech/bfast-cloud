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

// new DatabaseConfigFactory(getBFastDatabaseConfigs().mongoDbUri)
//     .collection('_Project').then(async collection => {
//     try {
//         const pNameIndex = await collection.indexExists('projectId');
//         if (!pNameIndex) {
//             await collection.createIndex({projectId: 1}, {unique: true});
//         }
//     } catch (e) {
//         throw e;
//     }
// }).catch(reason => {
//     console.log(reason);
//     process.exit(-1);
// });

/**
 *
 * @type {WebServices}
 */
const bfastDatabaseWebService = initialize(config);
export const {rules} = bfastDatabaseWebService.rest();
export const {jwk} = bfastDatabaseWebService.rest();
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
