import bfast from "bfast";
import {Options} from "../../src/options.mjs";
import {DatabaseConfigFactory} from "../../src/factories/database-config.factory.mjs";
import {EmailFactory} from "../../src/factories/email.factory.mjs";
import {SecurityFactory} from "../../src/factories/security.factory.mjs";
import {UserStoreFactory} from "../../src/factories/user-store.factory.mjs";
import {ProjectStoreFactory} from "../../src/factories/project-store.factory.mjs";
import {RouterGuardFactory} from "../../src/factories/router-guard.factory.mjs";


const prefix = '/projects';
const options = new Options();
const databaseFactory = new DatabaseConfigFactory(options.databaseURI);
const emailFactory = new EmailFactory();
const securityFactory = new SecurityFactory();
const userFactory = new UserStoreFactory(emailFactory, securityFactory);
const projectFactory = new ProjectStoreFactory(databaseFactory, options.containerOrchAdapter(), securityFactory);
const _routerGuard = new RouterGuardFactory(userFactory, projectFactory, securityFactory, options);

export const syncProjectsFromDbToOrchestration = bfast.functions().onGetHttpRequest(`/sync`, [
        // (request, response, next) => {
        //     _routerGuard.checkToken(request, response, next);
        // },
        async (request, response, next) => {
            try {
                const instances = await options.containerOrchAdapter().instances();
                const projects = await projectFactory.getAllProjects(null, 0);
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
                    if (project.dry_run === true) {
                        return;
                    }
                    let faasHealth;
                    try {
                        faasHealth = await bfast.functions()
                            .request(`https://${project.projectId}-faas.bfast.mraba.co.tz/functions-health`)
                            .get();
                    } catch (e) {
                        console.log(e && e.response ? e.response.data : e.toString());
                    }
                    if (!(faasHealth && typeof faasHealth.message === "string")) {
                        projectFactory.deployProjectInCluster(project, [], !!project.dry_run)
                            .then(v => console.log('re-sync ' + project.projectId))
                            .catch(console.log);
                    }
                }

                async function daasCheck(project) {
                    if (project.dry_run === true) {
                        return;
                    }
                    let daasHealth;
                    try {
                        daasHealth = await bfast.functions()
                            .request(`https://${project.projectId}-daas.bfast.mraba.co.tz/functions-health`)
                            .get();
                    } catch (e) {
                        console.log(e && e.response ? e.response.data : e.toString());
                    }
                    if (!(daasHealth && typeof daasHealth.message === "string")) {
                        projectFactory.deployProjectInCluster(project, [], !!project.dry_run)
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
                response.status(400).send({message: 'Fails to re-sync projects'});
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
                        console.log(reason);
                        response.status(404).send(reason);
                    });
            } else {
                response.status(400).send({message: 'Invalid data'})
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
                &&
                request.params
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
                    // body.rsa = body && body.rsa && body.rsa.private && body.rsa.public ? body.rsa : await securityFactory.generateRsaPair();
                    const envs = request.query.envs && request.query.envs.toString().startsWith('[') ? JSON.parse(request.query.envs) : [];
                    // envs.push(`RSA_PUBLIC_KEY=${JSON.stringify(body.rsa.public)}`);
                    // envs.push(`RSA_KEY=${JSON.stringify(body.rsa.private)}`);
                    const dryRun = request.query.hasOwnProperty('dry');
                    body.dry_run = dryRun;
                    const result = await projectFactory.createProject(body, envs, dryRun);
                    response.json(result);
                } catch (reason) {
                    console.log(reason);
                    response.status(400).send({message: reason?.toString()});
                }
            } else {
                response.status(400).send({message: 'Invalid project data'});
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
                response.json(value.filter(x => x.dry_run === false));
            }).catch((reason) => {
                response.status(400).send(reason);
            });
        }
    ]
);

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
                    console.log(reason);
                    response.status(400).send(reason);
                });
            } else {
                response.status(400).send({message: 'Input not valid'});
            }
        }
    ]
);

export const patchProject = bfast.functions().onPutHttpRequest(
    `${prefix}/:projectId`,
    [
        (request, response, next) => {
            _routerGuard.checkToken(request, response, next);
        },
        // (request, response, next) => {
        //     _routerGuard.checkIsProjectOwner(request, response, next);
        // },
        (request, response) => {
            const body = request.body;
            if (body && Object.keys(body).length === 0) {
                response.status(400).send({message: 'Input is empty'});
            }
            const projectId = request.params.projectId;
            // @ts-ignore
            const valid = !!(projectId && request.uid);
            if (valid) {
                projectFactory
                    .patchProjectDetails(request.uid, projectId, body).then(value => {
                    response.status(200).json(value);
                }).catch((reason) => {
                    response.status(400).send(reason);
                });
            } else {
                response.status(400).send({message: 'Input not valid'});
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
                response.status(400).send(reason);
            });
        }
    ]
);
