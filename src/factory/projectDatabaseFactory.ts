import {DatabaseConfigAdapter, ProjectDatabaseAdapter} from "../adapters/database";
import {ProjectModel} from "../model/project";
import {Options} from "../config/Options";
import {DatabaseConfigFactory} from "./DatabaseConfigFactory";

export class ProjectDatabaseFactory implements ProjectDatabaseAdapter {
    collectionName = '_Project';
    private readonly database: DatabaseConfigAdapter;

    constructor(private readonly options: Options) {
        this.database = this.options.databaseConfigAdapter ?
            this.options.databaseConfigAdapter : new DatabaseConfigFactory(this.options)
    }

    insertProject(project: ProjectModel): Promise<ProjectModel> {
        return new Promise<ProjectModel>(async (resolve, reject) => {
            try {
                const projectColl = await this.database.collection(this.collectionName);
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
            const projectCollection = await this.database.collection(this.collectionName);
            const result = await projectCollection.findOneAndDelete({
                $or: [
                    {projectId: projectId},
                    {"user.uid": userId}
                ]
            });
            if (!result.ok && !result.value) {
                throw 'Project not found';
            }
            return 'project deleted, id : ' + result.value._id;
        } catch (reason) {
            console.error(reason);
            throw {message: 'Fails to delete project', reason: reason.toString()};
        }
    }

    getUserProjects(userId: string): Promise<ProjectModel[]> {
        return new Promise<any>(async (resolve, reject) => {
            if (userId) {
                try {
                    // let conn = await this.getConnection();
                    const projectCollection = await this.database.collection(this.collectionName);
                    // conn.db(this.DB_NAME).collection(this.collectionNames.project);
                    const results = await projectCollection.find({
                        $or: [{'user.uid': userId}, {"members.user.uid": userId}]
                    }).toArray();
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
            const projectCollection = await this.database.collection(this.collectionName);
            const project = await projectCollection.findOne({_id: this.database.getObjectId(objectId)});
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
            const projectCollection = await this.database.collection(this.collectionName);
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
            const projectCollection = await this.database.collection(this.collectionName);
            const project = await projectCollection.findOne({
                $or: [
                    {"user.uid": userId},
                    {"members.user.uid": userId}
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
            const projectCollection = await this.database.collection(this.collectionName);
            const result = await projectCollection.findOneAndUpdate({
                $or: [
                    {"user.uid": userId},
                    {"members.user.uid": userId}
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
            const projectCollection = await this.database.collection(this.collectionName);
            const project = await projectCollection.findOne({
                $or: [
                    {"user.uid": userId},
                ],
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

}
