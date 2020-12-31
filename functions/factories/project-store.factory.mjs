import {UserModel} from "../models/user.model.mjs";
import {ProjectModel} from "../models/project.model.mjs";
import {DatabaseConfigFactory} from "./database-config.factory.mjs";


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
    // TODO: must run inside transaction
    async createProject(project) {
        try {
            if (project &&
                project.projectId &&
                project.projectId !== '' &&
                project.name &&
                project.name !== '' &&
                project.parse &&
                project.parse.appId &&
                project.parse.appId !== '' &&
                project.parse.masterKey !== '') {
                project.members = [];
                if (!project.type || project.type === '') {
                    project.type = 'bfast';
                }
                // const value = await this.database.createProject(project);
                const projectColl = await this._database.collection(this.collectionName);
                const result = await projectColl.insertOne({
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
                });
                const pNameIndex = await projectColl.indexExists('projectId');
                if (!pNameIndex) {
                    await projectColl.createIndex({projectId: 1}, {unique: true});
                }
                const adminColl = await this._database.getDatabase('admin');
                try {
                    await adminColl.removeUser(project.parse.appId);
                } catch (_) {
                }
                try {
                    await adminColl.addUser(project.parse.appId, project.parse.masterKey, {
                        roles: [
                            {role: "readWrite", db: project.projectId}
                        ]
                    });
                } catch (e) {
                    console.warn(e);
                }
                project.id = result.insertedId.toString()
                return this._deployProjectInCluster(project);
            } else {
                throw {message: 'project object is not well defined'}
            }
        } catch (reason) {
            let message;
            if (reason.code && reason.code === 11000) {
                const date = Date.now().toString();
                const sp = project.name + date.substring(9, date.length);
                message = `Project id you suggest is already in use, maybe try this : ${sp}, or try different project id`
            } else {
                message = reason && reason.message ? reason.message : reason.toString();
            }
            throw {message: message};
        }
    }

    /**
     *
     * @param project {ProjectModel}
     * @return {Promise<ProjectModel>}
     * @private
     */
    async _deployProjectInCluster(project) {
        try {
            await this.orchestration.databaseInstanceCreate(project);
            await this.orchestration.functionsInstanceCreate(project);
            return project;
        } catch (reason) {
            try {
                await this.deleteUserProject(project.id ? project.id : '', project.projectId);
            } catch (e) {
                console.warn(e && e.message ? e.message : e.toString(), 'remove project when deploy fails');
            }
            throw {
                message: 'Project not created',
                reason: reason && reason.message ? reason.message : reason.toString()
            };
        }
    }

    /**
     *
     * @param userId {string}
     * @param projectId {string}
     * @return {Promise<*>}
     */
    //TODO: must run inside transaction
    async deleteUserProject(userId, projectId) {
        if (!userId || userId === '') {
            throw {message: 'Please provide uid'};
        } else if (!projectId || projectId === '') {
            throw {message: 'projectId required'};
        } else {
            const user = await this._users.getUser(userId);
            const projectCollection = await this._database.collection(this.collectionName);
            const response = await projectCollection.deleteMany({
                projectId: projectId,
                "user.email": user.email
            });
            if (response && response.result.ok) {
                try {
                    await this._removeProjectInCluster(projectId);
                    return {message: 'Project deleted and removed'};
                } catch (e) {
                    console.warn(e);
                    return {message: 'Project deleted'};
                }
            } else {
                throw {message: 'Project not found'};
            }
        }
    }

    /**
     *
     * @param projectId {string}
     * @return {Promise<string>}
     * @private
     */
    // TODO : Must throw error when async fails
    async _removeProjectInCluster(projectId) {
        try {
            this.orchestration.functionsInstanceRemove(projectId).catch(_ => {
            });
            this.orchestration.databaseInstanceRemove(projectId).catch(_ => {
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
            throw {message: 'uid field required'};
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
            return await projectCollection.find()
                .limit(size ? size : 100)
                .skip(skip ? skip : 0)
                .toArray();
        } catch (e) {
            throw {message: 'Fails to get all projects', reason: e.toString()}
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
                    {"members.user.email": user.email}
                ],
                projectId: projectId
            });
            if (!project) {
                throw 'User does not have that project';
            }
            return project;
        } catch (e) {
            throw {message: 'Fail to get project details', reason: e.toString()};
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
                    {"members.user.email": user.email}
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
        }
    }

    /**
     *
     * @param projectId {string}
     * @param user {UserModel}
     * @return {Promise<*>}
     */
    async addMemberToProject(projectId, user) {
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

    }

}
