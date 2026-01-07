import bfast from "bfast";
import {config} from "../src/options.mjs";

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


