// import bfastnode from 'bfastnode';
// import {UserStoreFactory} from "../factories/user-store.factory.mjs";
// import {DatabaseConfigFactory} from "../factories/database-config.factory.mjs";
// import {getBFastDatabaseConfigs, Options} from "../options.mjs";
// import {EmailFactory} from "../factories/email.factory.mjs";
// import {SecurityFactory} from "../factories/security.factory.mjs";
// import {ProjectStoreFactory} from "../factories/project-store.factory.mjs";
// import {SwarmOrchestrationFactory} from "../factories/swarm-orchestration.factory.mjs";
// import moment from "moment";
//
// const {bfast} = bfastnode;
// const {mongoDbUri} = getBFastDatabaseConfigs();
// const options = new Options();
// const {shellAdapter} = options;
// const databaseFactory = new DatabaseConfigFactory(mongoDbUri);
// const emailFactory = new EmailFactory();
// const swarmOrch = new SwarmOrchestrationFactory(shellAdapter(), options);
// const securityFactory = new SecurityFactory();
// let accountingRunning = false;
// const userFactory = new UserStoreFactory(databaseFactory, emailFactory, securityFactory);
// const projectFactory = new ProjectStoreFactory(databaseFactory, userFactory, swarmOrch)
//
// export const accountingJob776 = bfast.functions().onJob(
//     {
//         second: '*',
//         minute: '*/15',
//         day: '*',
//         hour: '*',
//         dayOfWeek: '*',
//         month: '*'
//     },
//     _ => {
//         if (accountingRunning === false) {
//             accountingRunning = true;
//             console.log('start accounting job', _);
//             projectFactory.getAllProjects().then(async projects => {
//                 for (const project of projects) {
//                     if (project && project.projectId) {
//                         let instances = 0;
//                         const healthD = await daasHealth(project.projectId);
//                         instances = healthD === true ? instances + 1 : instances;
//                         const healthF = await faasHealth(project.projectId);
//                         instances = healthF === true ? instances + 1 : instances;
//                         const r = await bfast.database().table('transactions')
//                             .query()
//                             .equalTo('date', moment().format('YYYY-MM-DD'))
//                             .equalTo('from', 'invoice')
//                             .equalTo('to', 'account_receivable')
//                             .equalTo('user_email', project.user.email)
//                             .equalTo('project_id', project.projectId)
//                             .updateBuilder()
//                             .set('date', moment().format('YYYY-MM-DD'))
//                             .set('month', moment().format('YYYY-MM'))
//                             .set('from', 'invoice')
//                             .set('to', 'account_receivable')
//                             .set('user_email', project.user.email)
//                             .set('amount', 350 * instances)
//                             .set('project_id', project.projectId)
//                             .set('details', 'host cost for a day for all instances')
//                             .upsert(true)
//                             .update({returnFields: []});
//                         console.log(r);
//                     }
//                 }
//             }).catch(reason => {
//                 console.log(reason);
//             }).finally(() => {
//                 accountingRunning = false;
//             });
//         } else {
//             console.log('accounting already running');
//         }
//     }
// );
//
// /**
//  *
//  * @param projectId {string}
//  */
// async function faasHealth(projectId) {
//     try {
//         await bfast.functions().request(`https://${projectId}-faas.bfast.fahamutech.com/functions-health`)
//         return true;
//     } catch (_12) {
//         return false;
//     }
// }
//
// /**
//  *
//  * @param projectId {string}
//  */
// async function daasHealth(projectId) {
//     try {
//         await bfast.functions().request(`https://${projectId}-daas.bfast.fahamutech.com/functions-health`)
//         return true;
//     } catch (_12) {
//         return false;
//     }
// }
