import {UserModel} from "../models/user.model.mjs";
import {ProjectModel} from "../models/project.model.mjs";
import {DatabaseConfigFactory} from "./database-config.factory.mjs";
import {v4} from "uuid";


export class ProjectStoreFactory {

    collectionName = '_Project';

    /**
     *
     * @param database {DatabaseConfigFactory}
     * @param userFactory {UserStoreFactory}
     * @param orchestration {OrchestrationAdapter}
     */
    constructor(database, userFactory, orchestration) {
        this.orchestration = orchestration;
        this._users = userFactory;
        this._database = database;
    }

    /**
     *
     * @param project {ProjectModel}
     * @return {Promise<ProjectModel>}
     */
    async createProject(project) {
        return new Promise(async (resolve, reject) => {
            try {
                await this._addUserToDb(project, null);
                await this._database.transaction(async (session, mongo) => {
                    project.members = [];
                    if (!project.type || project.type.toString() === '') {
                        project.type = 'bfast';
                    }
                    const projectColl = await this._database.collection(this.collectionName);
                    const result = await projectColl.insertOne({
                        _id: v4(),
                        name: project.name,
                        projectId: project.projectId,
                        description: project.description,
                        type: project.type,
                        user: project.user,
                        members: project.members ? project.members : [],
                        isParse: project.isParse ? project.isParse : false,
                        parse: (project.parse && project.parse.appId && project.parse.masterKey) ? project.parse : null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }, {
                        session: session
                    });
                    project.id = result.insertedId.toString();
                    await this.deployProjectInCluster(project);
                    resolve(project);
                });
            } catch (reason) {
                let message;
                if (reason && reason.code && reason.code === 11000) {
                    const date = Date.now().toString();
                    const sp = project.name + date.substring(9, date.length);
                    message = `Project id you suggest is already in use, maybe try this : ${sp}, or try different project id`
                } else {
                    message = reason && reason.message ? reason.message : reason.toString();
                }
                reject({message: message});
            }
        });

    }

    /**
     *
     * @param project {ProjectModel}
     * @return {Promise<ProjectModel>}
     */
    async deployProjectInCluster(project) {
        if (project.type.toString() === 'daas') {
            await this.orchestration.databaseInstanceCreate(project);
        } else if (project.type.toString() === 'faas') {
            await this.orchestration.functionsInstanceCreate(project);
        } else {
            await this.orchestration.databaseInstanceCreate(project);
            await this.orchestration.functionsInstanceCreate(project);
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
        try {
            if (!userId || userId === '') {
                throw {message: 'Please provide uid'};
            } else if (!projectId || projectId === '') {
                throw {message: 'projectId required'};
            } else {
                await this._database.transaction(async (session) => {
                    // try {
                    const user = await this._users.getUser(userId);
                    const projectCollection = await this._database.collection(this.collectionName);
                    const response = await projectCollection.deleteMany({
                        projectId: projectId,
                        "user.email": user.email
                    });
                    if (response && response.result.ok) {
                        await this._removeProjectInCluster(projectId);
                    } else {
                        throw {message: 'Project not found'};
                    }
                    // } catch (e) {
                    //     session.abortTransaction();
                    //     throw e;
                    // }
                });
                return {message: 'Project deleted and removed'};
            }
        } finally {
            this._database.disconnect();
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
        try {
            if (!userId || userId === '') {
                throw {message: 'userId required'};
            } else {
                if (userId) {
                    try {
                        const user = await this._users.getUser(userId);
                        const projectCollection = await this._database.collection(this.collectionName);
                        return await projectCollection.find({
                            $or: [
                                {'user.email': user.email},
                                {"members.email": user.email}
                            ]
                        }).toArray();
                    } catch (reason) {
                        console.log(reason);
                        throw {message: reason.toString()};
                    }
                } else {
                    throw {message: 'Please provide a user id'};
                }
            }
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param objectId {string}
     * @return {Promise<ProjectModel>}
     */
    async getProject(objectId) {
        try {
            const projectCollection = await this._database.collection(this.collectionName);
            const project = await projectCollection.findOne({_id: this._database.getObjectId(objectId)});
            if (!project) {
                throw 'Project not found';
            }
            return project;
        } catch (e) {
            console.error(e);
            throw {message: 'Fails to get project', reason: e.toString()};
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param size {number}
     * @param skip {number}
     * @return {Promise<ProjectModel[]>}
     */
    async getAllProjects(size, skip) {
        try {
            const projectCollection = await this._database.collection(this.collectionName);
            const totalProjects = await projectCollection.find().count();
            return await projectCollection.find()
                .limit(size ? size : totalProjects)
                .skip(skip ? skip : 0)
                .toArray();
        } catch (e) {
            throw {message: 'Fails to get all projects', reason: e.toString()}
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param userId {string}
     * @param projectId {string}
     * @return {Promise<ProjectModel[]>}
     */
    async getUserProject(userId, projectId) {
        try {
            const user = await this._users.getUser(userId);
            const projectCollection = await this._database.collection(this.collectionName);
            const project = await projectCollection.findOne({
                $or: [
                    {"user.email": user.email},
                    {"members.email": user.email}
                ],
                projectId: projectId
            });
            if (!project) {
                throw 'User does not have that project';
            }
            return project;
        } catch (e) {
            throw {message: 'Fail to get project details', reason: e.toString()};
        } finally {
            this._database.disconnect();
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
        try {
            const user = await this._users.getUser(userId);
            const projectCollection = await this._database.collection(this.collectionName);
            const result = await projectCollection.findOneAndUpdate({
                $or: [
                    {"user.email": user.email},
                    {"members.email": user.email}
                ],
                projectId: projectId
            }, data);
            if (!result.ok) {
                throw 'Project not updated';
            }
            return {message: 'Project updated'}
        } catch (e) {
            console.error(e);
            throw {message: 'Fails to update project description', reason: e.toString()};
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param userId {string}
     * @param projectId {string}
     * @return {Promise<*>}
     */
    async getOwnerProject(userId, projectId) {
        try {
            const user = await this._users.getUser(userId);
            const projectCollection = await this._database.collection(this.collectionName);
            const project = await projectCollection.findOne({
                "user.email": user.email,
                projectId: projectId
            });
            if (!project) {
                throw 'User does not own that project';
            }
            return project;
        } catch (e) {
            console.error(e);
            throw {message: 'Fails to identify owner', reason: e.toString()}
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param userId {string}
     * @param projectId {string}
     * @return {Promise<*>}
     */
    async getOwnerOrMemberProject(userId, projectId) {
        try {
            const user = await this._users.getUser(userId);
            const projectCollection = await this._database.collection(this.collectionName);
            const project = await projectCollection.findOne({
                $or: [
                    {
                        "user.email": user.email,
                        projectId: projectId
                    },
                    {
                        "members.email": user.email,
                        projectId: projectId
                    }
                ]
            });
            if (!project) {
                throw 'User does not own or invited to that project';
            }
            return project;
        } catch (e) {
            console.error(e);
            throw {message: 'Fails to identify owner', reason: e.toString()}
        } finally {
            this._database.disconnect();
        }
    }

    /**
     *
     * @param projectId {string}
     * @param user {UserModel}
     * @return {Promise<*>}
     */
    async addMemberToProject(projectId, user) {
        try {
            if (user && user.email) {
                const projectColl = await this._database.collection(this.collectionName);
                const response = await projectColl.updateOne({projectId: projectId}, {
                    $push: {
                        'members': user
                    }
                });
                return response.result;
            }
            throw new Error('User model miss required data');
        } finally {
            this._database.disconnect();
        }
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
            const r = await adminColl.removeUser(project.parse.appId);
            console.log(r, '=> mongo remove user');
        } catch (_) {
            console.log(_.toString(), '=> mongo remove user');
        }
        // try {
        await adminColl.addUser(
            project.parse.appId.toString().replace(new RegExp('[-]', 'ig'), '').trim(),
            project.parse.masterKey.toString().replace(new RegExp('[-]', 'ig'), '').trim(), {
            // session: session,
            roles: [
                {role: "readWrite", db: project.projectId}
            ]
        });
        console.log('=> mongo create user');
        // } catch (e) {
        //     console.warn(e.toString(), '=> mongo create user');
        // }
        return 'done reset user auth';
    }
}
