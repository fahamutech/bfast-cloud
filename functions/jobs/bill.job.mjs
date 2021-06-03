import bfastnode from 'bfastnode';
import {UserStoreFactory} from "../factories/user-store.factory.mjs";
import {DatabaseConfigFactory} from "../factories/database-config.factory.mjs";
import {getBFastDatabaseConfigs, Options} from "../options.mjs";
import {EmailFactory} from "../factories/email.factory.mjs";
import {SecurityFactory} from "../factories/security.factory.mjs";
import {ProjectStoreFactory} from "../factories/project-store.factory.mjs";
import {SwarmOrchestrationFactory} from "../factories/swarm-orchestration.factory.mjs";
import moment from "moment";

const {bfast} = bfastnode;
const {mongoDbUri} = getBFastDatabaseConfigs();
const options = new Options();
const {shellAdapter} = options;
const databaseFactory = new DatabaseConfigFactory(mongoDbUri);
const emailFactory = new EmailFactory();
const swarmOrch = new SwarmOrchestrationFactory(shellAdapter(), options);
const securityFactory = new SecurityFactory();
let accountingRunning = false;
const userFactory = new UserStoreFactory(databaseFactory, emailFactory, securityFactory);
const projectFactory = new ProjectStoreFactory(databaseFactory, userFactory, swarmOrch)

export const accountingJob776 = bfast.functions().onJob(
    {
        second: '*',
        minute: '*/30',
        day: '*',
        hour: '*',
        dayOfWeek: '*',
        month: '*'
    },
    _ => {
        if (accountingRunning === false) {
            accountingRunning = true;
            console.log('start accounting job', _);
            bfast.database().table('_Project').getAll().then(async projects => {
                for (const project of projects) {
                    if (project && project.projectId) {
                        let instances = 0;
                        const healthD = await daasHealth(project.projectId);
                        instances = healthD === true ? instances + 1 : instances;
                        const healthF = await faasHealth(project.projectId);
                        instances = healthF === true ? instances + 1 : instances;
                        await bfast.database().table('invoice')
                            .query()
                            .byId(`${project.projectId}-${moment().format('YYYY-MM-DD')}`)
                            .updateBuilder()
                            .doc({
                                date: moment().format('YYYY-MM-DD'),
                                month: moment().format('YYYY-MM'),
                                user_email: project.user.email,
                                user: project.user,
                                amount: 350 * instances,
                                project_projectId: project.projectId,
                                project_id: project.id,
                                project_name: project.name,
                                project_type: project.type,
                                project_label: project.label,
                                instances: instances,
                                details: `host cost for a day for ${instances} instances`
                            })
                            .upsert(true)
                            .update({returnFields: ['id']});
                    }
                }
            }).catch(reason => {
                console.log(reason);
            }).finally(() => {
                accountingRunning = false;
            });
        } else {
            console.log('billing job already running');
        }
    }
);

/**
 *
 * @param projectId {string}
 */
async function faasHealth(projectId) {
    try {
        const rr = await bfast.functions().request(`https://${projectId}-faas.bfast.fahamutech.com/functions-health`).get();
        console.log(rr, '***fffffasssss*********');
        return true;
    } catch (_12) {
        return false;
    }
}

/**
 *
 * @param projectId {string}
 */
async function daasHealth(projectId) {
    try {
        await bfast.functions().request(`https://${projectId}-daas.bfast.fahamutech.com/functions-health`).get();
        return true;
    } catch (_12) {
        return false;
    }
}
