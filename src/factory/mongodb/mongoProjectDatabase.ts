import {ProjectDatabaseAdapter} from "../../adapters/database";
import {ProjectModel} from "../../model/project";
import {MongoConnector} from "./mongoDbConfigurations";

export abstract class MongoProjectDatabase extends MongoConnector implements ProjectDatabaseAdapter {

    protected constructor() {
        super();
    }

    insertProject(project: ProjectModel): Promise<ProjectModel> {
        return new Promise<ProjectModel>(async (resolve, reject) => {
            if (project &&
                project.name &&
                project.projectId &&
                project.projectId !== 'cloud' &&
                project.projectId !== 'console' &&
                project.projectId !== 'dashboard' &&
                project.description &&
                project.user) {
                try {
                    let conn = await this.getConnection();
                    const projectColl = conn.db(this.DB_NAME).collection(this.collectionNames.project);
                    const result = await projectColl.insertOne({
                        name: project.name,
                        projectId: project.projectId,
                        description: project.description,
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
            } else {
                reject({message: 'Please provide enough information about your project'});
            }
        });
    }

    deleteProject(id: string, projectId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (id && projectId) {
                try {
                    let conn = await this.getConnection();
                    const projectCollection = conn.db(this.DB_NAME).collection(this.collectionNames.project);
                    const result = await projectCollection.findOneAndDelete({projectId: projectId, _id: id});
                    console.log('project delete id : ' + result.value._id);
                    resolve(result);
                } catch (reason) {
                    console.log(reason);
                    reject({message: reason.toString()});
                }
            } else {
                reject({message: 'Please provide project id and object id'});
            }
        });
    }

    getProjects(userId: string): Promise<ProjectModel[]> {
        return new Promise<any>(async (resolve, reject) => {
            if (userId) {
                try {
                    let conn = await this.getConnection();
                    const projectCollection = conn.db(this.DB_NAME).collection(this.collectionNames.project);
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

}
