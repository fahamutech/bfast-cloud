import {DatabaseAdapter, ProjectStoreAdapter} from "../adapter/database";
import {ProjectModel} from "../model/project";
import {Options} from "../config/Options";
import {DatabaseConfigFactory} from "./DatabaseConfigFactory";
import {UserController} from "../controller/UserController";
import {UserModel} from "../model/user";

let _database: DatabaseAdapter;
let _users: UserController;

export class ProjectStoreFactory implements ProjectStoreAdapter {

    collectionName = '_Project';

    constructor(private readonly options: Options) {
        _users = new UserController(this.options);
        _database = this.options.databaseConfigAdapter ?
            this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options)
    }

    insertProject(project: ProjectModel): Promise<ProjectModel> {
        return new Promise<ProjectModel>(async (resolve, reject) => {
            try {
                const projectColl = await _database.collection(this.collectionName);
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
                project.id = result.insertedId as string;
                resolve(project);
            } catch (reason) {
                let message;
                if (reason.code && reason.code == 11000) {
                    const date = Date.now().toString();
                    const sp = project.name + date.substring(9, date.length);
                    message = `Project id you suggest is already in use, maybe try this : ${sp}, or try different project id`
                } else {
                    message = reason.toString();
                }
                reject({message: message});
            }
        });
    }

    async deleteUserProject(userId: string, projectId: string): Promise<any> {
        try {
            const user = await _users.getUser(userId);
            const projectCollection = await _database.collection(this.collectionName);
            const response = await projectCollection.deleteMany({
                projectId: projectId,
                "user.email": user.email
            });
            if (response && response.result.ok) {
                return 'project deleted';
            } else {
                throw 'Project not found';
            }
        } catch (reason) {
            console.error(reason);
            throw {message: 'Fails to delete project', reason: reason.toString()};
        }
    }

    getUserProjects(userId: string, size?: number, skip?: number): Promise<ProjectModel[]> {
        return new Promise<any>(async (resolve, reject) => {
            if (userId) {
                try {
                    const user = await _users.getUser(userId);
                    console.log(user.email);
                    const projectCollection = await _database.collection(this.collectionName);
                    const results = await projectCollection.find({
                        $or: [
                            {'user.email': user.email},
                            {"members.email": user.email}
                        ]
                    }).toArray();
                    console.log(results);
                    resolve(results);
                } catch (reason) {
                    console.log(reason);
                    reject({message: reason.toString()});
                }
            } else {
                reject({message: 'Please provide a user id'});
            }
        });
    }

    async getProject(objectId: string): Promise<ProjectModel> {
        try {
            const projectCollection = await _database.collection(this.collectionName);
            const project = await projectCollection.findOne({_id: _database.getObjectId(objectId)});
            if (!project) {
                throw 'Project not found';
            }
            return project;
        } catch (e) {
            console.error(e);
            throw {message: 'Fails to get project', reason: e.toString()};
        }
    }

    async getAllProjects(size?: number, skip?: number): Promise<ProjectModel[]> {
        try {
            const projectCollection = await _database.collection(this.collectionName);
            return await projectCollection.find()
                .limit(size ? size : 100)
                .skip(skip ? skip : 0)
                .toArray();
        } catch (e) {
            throw {message: 'Fails to get all projects', reason: e.toString()}
        }
    }

    // under discussion
    async getUserProject(userId: string, projectId: string): Promise<ProjectModel[]> {
        try {
            const user = await _users.getUser(userId);
            const projectCollection = await _database.collection(this.collectionName);
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

    async patchProjectDetails(userId: string, projectId: string, data: { description?: string; name?: string }):
        Promise<any> {
        try {
            const user = await _users.getUser(userId);
            const projectCollection = await _database.collection(this.collectionName);
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

    async getOwnerProject(userId: string, projectId: string): Promise<any> {
        try {
            const user = await _users.getUser(userId);
            const projectCollection = await _database.collection(this.collectionName);
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

    async addMemberToProject(projectId: string, user: UserModel): Promise<any> {
        try {
            const projectColl = await _database.collection(this.collectionName);
            const response = await projectColl.updateOne({projectId: projectId}, {
                $push: {
                    'members': user
                }
            });
            return response.result;
        } catch (e) {
            throw e;
        }
    }

}
