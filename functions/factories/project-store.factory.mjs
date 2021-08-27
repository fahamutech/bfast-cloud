import {UserModel, UserRoles} from "../models/user.model.mjs";
import {ProjectModel} from "../models/project.model.mjs";
import {DatabaseConfigFactory} from "./database-config.factory.mjs";
import bfast from "bfast";


export class ProjectStoreFactory {

    collectionName = '_Project';

    /**
     *
     * @param database {DatabaseConfigFactory}
     * @param orchestration {OrchestrationAdapter}
     * @param sFactory {SecurityFactory}
     */
    constructor(
        database,
        orchestration,
        sFactory) {
        this.orchestration = orchestration;
        this._database = database;
        this.securityFactory = sFactory
    }

    /**
     *
     * @param project {ProjectModel}
     * @param envs {Array<string>}
     * @param dryRun{boolean}
     * @return {Promise<ProjectModel>}
     */
    async createProject(project, envs, dryRun) {
        await this._addUserToDb(project, null);
        project.members = project.members ? project.members : [];
        if (!project.type || project.type.toString() === '') {
            project.type = 'bfast';
        }
        project.isParse = true;
        project.createdAt = new Date();
        project.updatedAt = new Date();
        project.id = project?.projectId?.concat('-id');
        const prevProject = await bfast.database()
            .collection(this.collectionName)
            .get(project.id, null, {useMasterKey: true});
        if (prevProject && project.projectId) {
            const date = Date.now().toString();
            const sp = project.name + date.substring(9, date.length);
            const message = `Project id you suggest is already in use, maybe try this : ${sp}, or try different project id`
            throw {message: message};
        }
        project = await bfast.database()
            .table(this.collectionName)
            .save(project, {useMasterKey: true});
        await this.deployProjectInCluster(project, envs, dryRun);
        return project;
    }

    /**
     *
     * @param project {ProjectModel}
     * @param envs {Array<string>}
     * @param dryRun {boolean}
     * @return {Promise<ProjectModel>}
     */
    async deployProjectInCluster(project, envs, dryRun) {
        project.rsa = project.rsa && project.rsa.private && project.rsa.public ? project.rsa : await this.securityFactory.generateRsaPair();
        envs.push(`RSA_PUBLIC_KEY=${JSON.stringify(project.rsa.public)}`);
        envs.push(`RSA_KEY=${JSON.stringify(project.rsa.private)}`);
        if (project.type.toString().trim() === 'daas') {
            await this.orchestration.databaseInstanceCreate(project, envs, dryRun);
        } else if (project.type.toString().trim() === 'faas') {
            await this.orchestration.functionsInstanceCreate(project, envs, dryRun);
        } else {
            await this.orchestration.databaseInstanceCreate(project, envs, dryRun);
            await this.orchestration.functionsInstanceCreate(project, envs, dryRun);
        }
        return project;
    }

    /**
     *
     * @param userId {string}
     * @param projectId {string}
     * @return {Promise<*>}
     */
    async deleteUserProject(userId, projectId) {
        if (!userId || userId === '') {
            throw {message: 'Please provide uid'};
        } else if (!projectId || projectId === '') {
            throw {message: 'projectId required'};
        } else {
            const user = await bfast.database().table('_User').get(userId, null, {useMasterKey: true});
            if (!user) {
                throw {message: 'User does not own this project'};
            }
            const r = await bfast.database().bulk().delete(this.collectionName, {
                    query: {
                        filter: {
                            projectId: projectId,
                            user: {
                                email: user.email
                            }
                        }
                    }
                }
            ).commit();
            if (r) {
                this._removeProjectInCluster(projectId).catch(console.log);
            }
            return {message: 'Project deleted and removed'};
        }
    }

    /**
     *
     * @param projectId {string}
     * @return {Promise<string>}
     * @private
     */
    async _removeProjectInCluster(projectId) {
        try {
            this.orchestration.functionsInstanceRemove(projectId).catch(_ => {
                console.warn(_.toString(), 'remove faas');
            });
            this.orchestration.databaseInstanceRemove(projectId).catch(_ => {
                console.warn(_.toString(), 'remove daas');
            });
            return 'Project removed in cluster';
        } catch (e) {
            throw {
                message: "Project fails to be removed from stack",
                reason: e && e.message ? e.message : e.toString()
            };
        }
    }

    /**
     *
     * @param userId {string}
     * @param size {number}
     * @param skip {number}
     * @return {Promise<ProjectModel[]>}
     */
    async getUserProjects(userId, size, skip) {
        if (!userId || userId === '') {
            throw {message: 'userId required'};
        } else {
            const user = await bfast.database().table('_User').get(userId, null, {useMasterKey: true});
            if (user.role === UserRoles.ADMIN_ROLE) {
                return bfast.database().table(this.collectionName).getAll();
            } else {
                return bfast.database().table(this.collectionName).query().raw([
                    {
                        user: {
                            email: user.email
                        }
                    },
                    {
                        members: {
                            email: user.email
                        }
                    }
                ]);
            }
        }
    }

    /**
     *
     * @param size {number | null}
     * @param skip {number | null}
     * @return {Promise<ProjectModel[]>}
     */
    async getAllProjects(size = null, skip = null) {
        return bfast.database().table(this.collectionName).getAll();
        // try {
        //     const projectCollection = await this._database.collection(this.collectionName);
        //     const totalProjects = await projectCollection.find({}).count();
        //     return await projectCollection.find({})
        //         .limit(size ? size : totalProjects)
        //         .skip(skip ? skip : 0)
        //         .toArray();
        // } catch (e) {
        //     throw {message: 'Fails to get all projects', reason: e.toString()}
        // } finally {
        //     this._database.disconnect();
        // }
    }

    /**
     *
     * @param userId {string}
     * @param projectId {string}
     * @return {Promise<ProjectModel[]>}
     */
    async getUserProject(userId, projectId) {
        const user = await bfast.database().table('_User').get(userId, null, {useMasterKey: true});
        const project = await bfast.database().table(this.collectionName).query().raw([
            {
                projectId: projectId,
                user: {
                    email: user.email
                }
            },
            {
                projectId: projectId,
                members: {
                    email: user.email
                }
            }
        ]);
        if (Array.isArray(project) && project.length === 1) {
            return project[0];
        } else {
            throw {message: 'Fail to get project details'}
        }
    }

    /**
     *
     * @param userId {string}
     * @param projectId {string}
     * @param data {{ description: string, name: string }}
     * @return {Promise<*>}
     */
    async patchProjectDetails(userId, projectId, data) {
        delete data.id;
        delete data.projectId;
        const user = await bfast.database().table('_User').get(userId, null, {useMasterKey: true});

        const r = await bfast.database().bulk()
            .update(this.collectionName, {
                query: {
                    filter: [
                        {
                            projectId: projectId,
                            user: {
                                email: user.email
                            }
                        },
                        {
                            projectId: projectId,
                            members: {
                                email: user.email
                            }
                        }
                    ]
                },
                update: {
                    $set: data
                }
            }).commit();
        const updated = r[`update${this.collectionName}`];
        if (updated && Array.isArray(updated) && updated.length === 1) {
            return {message: `Project updated`};
        }
        throw {message: 'Project not updated'};
    }

    /**
     *
     * @param userId {string}
     * @param projectId {string}
     * @return {Promise<*>}
     */
    async getOwnerProject(userId, projectId) {
        const user = await bfast.database().table('_User').get(userId, null, {useMasterKey: true});
        const project = await bfast.database().table(this.collectionName).query().raw({
                projectId: projectId,
                user: {
                    email: user.email
                }
            }
        );
        if (Array.isArray(project) && project.length === 1) {
            return project[0];
        } else {
            throw {message: 'Fail to get project details'}
        }
    }

    /**
     *
     * @param userId {string}
     * @param projectId {string}
     * @return {Promise<*>}
     */
    async getOwnerOrMemberProject(userId, projectId) {
        return this.getUserProject(userId, projectId);
    }

    /**
     *
     * @param projectId {string}
     * @param user {UserModel}
     * @return {Promise<*>}
     */
    async addMemberToProject(projectId, user) {
        if (!user) {
            throw {message: 'user not available'};
        }
        if (!user.hasOwnProperty('email')) {
            throw {message: 'email is required'};
        }
        if (!user.hasOwnProperty('displayName')) {
            throw {message: 'displayName is required'};
        }
        const project = await bfast.database().table(this.collectionName).get(projectId + '-id');
        project.members.push(user);
        project.members = Array.from(project.members.reduce((a, b) => a.add(b), new Set()));
        await bfast.database().table(this.collectionName)
            .query()
            .byId(project.id)
            .updateBuilder()
            .doc(project)
            .update();
        return project;
    }

    /**
     *
     * @param project
     * @param session
     * @return {Promise<string>}
     * @private
     */
    async _addUserToDb(project, session) {
        const adminColl = await this._database.getDatabase('admin');
        try {
            const r = await adminColl.removeUser(
                project.parse.appId
                    .toString()
                    .replace(new RegExp('[-]', 'ig'), '')
                    .trim()
            );
            console.log(r, '=> mongo remove user');
        } catch (_) {
            console.log(_.toString(), '=> mongo remove user');
        }
        await adminColl.addUser(
            project.parse.appId.toString().replace(new RegExp('[-]', 'ig'), '').trim(),
            project.parse.masterKey.toString().replace(new RegExp('[-]', 'ig'), '').trim(), {
                roles: [
                    {role: "readWrite", db: project.projectId}
                ]
            });
        console.log('=> mongo create user');
        return 'done reset user auth';
    }
}
