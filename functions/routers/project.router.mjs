import bfastnode from "bfastnode";
import {Options} from "../options.mjs";
import {DatabaseConfigFactory} from "../factories/database-config.factory.mjs";
import {EmailFactory} from "../factories/email.factory.mjs";
import {SecurityFactory} from "../factories/security.factory.mjs";
import {UserStoreFactory} from "../factories/user-store.factory.mjs";
import {ProjectStoreFactory} from "../factories/project-store.factory.mjs";
import {RouterGuardFactory} from "../factories/router-guard.factory.mjs";

const {bfast} = bfastnode;
const prefix = '/projects';
const options = new Options();
const databaseFactory = new DatabaseConfigFactory(options.mongoURL);
const emailFactory = new EmailFactory();
const securityFactory = new SecurityFactory();
const userFactory = new UserStoreFactory(databaseFactory, emailFactory, securityFactory);
const projectFactory = new ProjectStoreFactory(databaseFactory, userFactory, options.containerOrchAdapter());
const _routerGuard = new RouterGuardFactory(userFactory, projectFactory, securityFactory, options);

export const syncProjectsFromDbToOrchestration = bfast.functions().onGetHttpRequest(`/sync`, [
        // (request, response, next) => {
        //     _routerGuard.checkToken(request, response, next);
        // },
        async (request, response, next) => {
            try {
                const instances = await options.containerOrchAdapter().instances();
                const projects = await projectFactory.getAllProjects(null, 0);
                bfast.init({
                    applicationId: 'bfast',
                    projectId: 'bfast'
                });

                const mapOfInstances = instances.reduce((a, b, i) => {
                    a[b] = i;
                    return a;
                }, {});
                projects.forEach(p => {
                    delete mapOfInstances[p.projectId.toString().trim().concat('_daas')];
                    delete mapOfInstances[p.projectId.toString().trim().concat('_faas')];
                });

                for (const k of Object.keys(mapOfInstances)) {
                    try {
                        await options.containerOrchAdapter().removeInstance(k);
                    } catch (e) {
                        console.log(e, 'INFO : try to remove instance');
                    }
                }

                async function faasCheck(project) {
                    let faasHealth;
                    try {
                        faasHealth = await bfast.functions()
                            .request(`https://${project.projectId}-faas.bfast.fahamutech.com/functions-health`)
                            .get();
                    } catch (e) {
                        console.log(e && e.response ? e.response.data : e.toString());
                    }
                    if (!(faasHealth && typeof faasHealth.message === "string")) {
                        projectFactory.deployProjectInCluster(project, [])
                            .then(v => console.log('re-sync ' + project.projectId))
                            .catch(console.log);
                    }
                }

                async function daasCheck(project) {
                    let daasHealth;
                    try {
                        daasHealth = await bfast.functions()
                            .request(`https://${project.projectId}-daas.bfast.fahamutech.com/functions-health`)
                            .get();
                    } catch (e) {
                        console.log(e && e.response ? e.response.data : e.toString());
                    }
                    if (!(daasHealth && typeof daasHealth.message === "string")) {
                        projectFactory.deployProjectInCluster(project, [])
                            .then(v => console.log('re-sync ' + project.projectId))
                            .catch(console.log);
                    }
                }

                for (const project of projects) {
                    const type = project.type.toString();
                    if (type === 'faas') {
                        faasCheck(project).catch(_23 => {
                        });
                    } else {
                        daasCheck(project).catch(_7665 => {
                        });
                    }
                }
                response.status(200).json({message: 'done sync projects'});
            } catch (reason) {
                console.log(reason);
                response.status(400).json({message: 'Fails to re-sync projects'});
            }
        }
    ]
);

export const getProject = bfast.functions().onGetHttpRequest(`${prefix}/:projectId`, [
        (request, response, next) => {
            _routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            const valid = !!(request.uid && request.params.projectId);
            if (valid) {
                projectFactory.getUserProject(request.uid, request.params.projectId)
                    .then((project) => {
                        response.status(200).json(project);
                    })
                    .catch((reason) => {
                        response.status(404).json(reason);
                    });
            } else {
                response.status(400).json({message: 'Invalid data'})
            }
        }
    ]
);

export const createNewProject = bfast.functions().onPostHttpRequest(`${prefix}/:type`, [
        (request, response, next) => {
            _routerGuard.checkToken(request, response, next);
        },
        // check is admin is a temporary middleware will be replaced
        // with a payment middleware
        options.devMode ? (req, res, next) => {
            next();
        } : (request, response, next) => {
            _routerGuard.checkIsAdmin(request, response, next);
        },
        /*check for payments if there is enough fund to proceed*/
        async (request, response) => {
            const body = request.body;
            const valid = !!(
                request.uid
                && request.params
                && request.params.type
                && body
                && body.name
                && body.projectId
                && body.projectId !== 'cloud'
                && body.projectId !== 'console'
                && body.projectId !== 'api'
                && body.projectId !== '_BFAST_ADMIN'
                && body.projectId !== 'dashboard'
                && body.parse
                && body.hostDomain
                && body.hostDomain !== ''
                && body.hostDomain !== 'null'
                && body.hostDomain !== 'undefined'
                && body.parse.appId
                && body.parse.masterKey
                && body.description);
            if (valid) {
                try {
                    body.user = await userFactory.getUser(request.uid);
                    body.type = request.params.type;
                    body.label = body.label ? body.label : 'bfast';
                    body.rsa = body && body.rsa && body.rsa.private && body.rsa.public ? body.rsa : await securityFactory.generateRsaPair();
                    const envs = request.query.envs && request.query.envs.toString().startsWith('[') ? JSON.parse(request.query.envs) : [];
                    // console.log(envs);
                    // if(!envs.includes('RSA_PUBLIC_KEY')){
                        console.log(JSON.stringify(body.rsa.public));
                    envs.push(`RSA_PUBLIC_KEY=${JSON.stringify(body.rsa.public)}`);
                    // }
                    // if(!envs.includes('RSA_KEY')){
                    envs.push(`RSA_KEY=${JSON.stringify(body.rsa.private)}`);
                    // }
                    const result = await projectFactory.createProject(body, envs);
                    // delete result.parse.masterKey;
                    response.json(result);
                } catch (reason) {
                    response.status(400).json(reason);
                }
            } else {
                response.status(400).json({message: 'Invalid project data'});
            }
        }
    ]
);

export const getProjects = bfast.functions().onGetHttpRequest(`${prefix}`, [
        (request, response, next) => {
            _routerGuard.checkToken(request, response, next);
        },
        (request, response, _) => {
            const size = request.query.size ? parseInt(request.query.size) : 1000;
            const skip = request.query.skip ? parseInt(request.query.skip) : 0;
            projectFactory.getUserProjects(request.uid, size, skip).then((value) => {
                response.json(value);
            }).catch((reason) => {
                response.status(400).json(reason);
            });
        }
    ]
);

/**
 *  rest: /projects/:projectId -X DELETE
 *  input:  -H'Authorization': token
 *  output: json
 * @private
 */
export const deleteProject = bfast.functions().onDeleteHttpRequest(`${prefix}/:projectId`, [
        (request, response, next) => {
            _routerGuard.checkToken(request, response, next);
        }, (request, response, next) => {
            _routerGuard.checkIsProjectOwner(request, response, next);
        },
        (request, response, _) => {
            const projectId = request.params.projectId;
            const valid = !!(projectId && request.uid);
            if (valid) {
                projectFactory.deleteUserProject(request.uid, projectId).then((value) => {
                    response.status(200).json(value);
                }).catch((reason) => {
                    response.status(500).json(reason);
                });
            } else {
                response.status(400).json({message: 'Input not valid'});
            }
        }
    ]
);

/**
 *  rest: /projects/:projectId -X PATCH
 *  input:  -H'Authorization': token, --data json
 *  output: json
 * @private
 */
export const patchProject = bfast.functions().onPutHttpRequest(`${prefix}/:projectId`, [
        (request, response, next) => {
            _routerGuard.checkToken(request, response, next);
        },
        // (request, response, next) => {
        //     _routerGuard.checkIsProjectOwner(request, response, next);
        // },
        (request, response) => {
            const body = request.body;
            const projectId = request.params.projectId;
            // @ts-ignore
            const valid = !!(projectId && request.uid);
            if (valid) {
                projectFactory
                    .patchProjectDetails(request.uid, projectId, body).then(value => {
                    response.status(200).json(value);
                }).catch((reason) => {
                    response.status(400).json(reason);
                });
            } else {
                response.status(400).json({message: 'Input not valid'});
            }
        }
    ]
);

export const addMemberToProject = bfast.functions().onPostHttpRequest(`${prefix}/:projectId/members`, [
        (request, response, next) => {
            _routerGuard.checkToken(request, response, next);
        },
        (request, response, next) => {
            _routerGuard.checkIsProjectOwner(request, response, next);
        },
        (request, response) => {
            const body = request.body;
            const projectId = request.params.projectId;
            projectFactory.addMemberToProject(projectId, body).then(value => {
                response.status(200).json(value);
            }).catch(reason => {
                response.status(400).json({message: 'member not added', reason: reason.toString()});
            });
        }
    ]
);
