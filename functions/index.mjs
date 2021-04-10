import bfastnode from "bfastnode";
import {DatabaseConfigFactory} from "./factories/database-config.factory.mjs";
import {BfastDatabaseCore} from "bfast-database-core";
import {getBFastDatabaseConfigs} from "./options.mjs";

const {bfast} = bfastnode;

bfast.init({
    applicationId: 'fahamutaarifa',
    projectId: 'fahamutaarifa'
}, 'fahamutaarifa');

new DatabaseConfigFactory(getBFastDatabaseConfigs().mongoDbUri)
    .collection('_Project').then(async collection => {
    try {
        const pNameIndex = await collection.indexExists('projectId');
        // const labelIndex = await collection.indexExists('label');
        if (!pNameIndex) {
            await collection.createIndex({projectId: 1}, {unique: true});
        }
        // if (!labelIndex) {
        //     await collection.createIndex({label: 1}, {unique: true});
        // }
    } catch (e) {
        throw e;
    }
}).catch(reason => {
    console.log(reason);
    process.exit(-1);
});

/**
 *
 * @type {WebServices}
 */
const bfastDatabaseWebService = new BfastDatabaseCore().init(getBFastDatabaseConfigs());
export const {rules} = bfastDatabaseWebService.rest();
export const {changes} = bfastDatabaseWebService.realtime({
    applicationId: getBFastDatabaseConfigs().applicationId,
    masterKey: getBFastDatabaseConfigs().masterKey
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
