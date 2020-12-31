import bfastnode from "bfastnode";
import {Options} from "../index.mjs";
import {DatabaseConfigFactory} from "../factories/database-config.factory.mjs";
import {EmailFactory} from "../factories/email.factory.mjs";
import {SecurityFactory} from "../factories/security.factory.mjs";
import {UserStoreFactory} from "../factories/user-store.factory.mjs";
import {ProjectStoreFactory} from "../factories/project-store.factory.mjs";
import {RouterGuardFactory} from "../factories/router-guard.factory.mjs";

const {bfast} = bfastnode;
const prefix = '/';
const options = new Options();
const databaseFactory = new DatabaseConfigFactory(options.mongoURL);
const emailFactory = new EmailFactory();
const securityFactory = new SecurityFactory(options.redisHOST);
const userFactory = new UserStoreFactory(databaseFactory, emailFactory, securityFactory);
const projectFactory = new ProjectStoreFactory(databaseFactory, userFactory, options.containerOrchAdapter());
const _routerGuard = new RouterGuardFactory(userFactory, projectFactory, securityFactory, options);


/**
 *  rest: / -X GET
 *  input: N/A
 *  output: json
 * @private
 */
export const landingPage = bfast.functions().onGetHttpRequest(`${prefix}`, [
        (request, response) => {
            response.status(200).json({message: 'welcome to secured bfast::cloud'});
        }
    ]
);

/**
 *  rest: /ui/password/reset/?token= -X GET
 *  input: N/A
 *  output: HTML
 * @private
 */
export const resetPasswordUi = bfast.functions().onGetHttpRequest('/ui/password/reset/', [
        _routerGuard.checkToken,
        (request, response) => {
            response.status(200).send(passwordRestComponent());
        }
    ]
);

