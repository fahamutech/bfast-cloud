import {BfastConfig} from "../configs/bfast.config";
import {UserModel} from "../models/user.model";
import {ShellAdapter} from "../adapters/shell.adapter";
import {ProjectStoreAdapter} from "../adapters/database.adapter";
import {NodeShellFactory} from "../factory/NodeShellFactory";
import {ResourceFactory} from "../factory/ResourceFactory";
import {ResourcesAdapter} from "../adapters/resources.adapter";
import {ProjectModel} from "../models/project.model";
import {ProjectStoreFactory} from "../factory/ProjectStoreFactory";

let shell: ShellAdapter;
let database: ProjectStoreAdapter;
let resources: ResourcesAdapter;

export class ProjectController {

    constructor(private options: BfastConfig) {
        shell = this.options.shellAdapter ?
            this.options.shellAdapter : new NodeShellFactory();
        database = this.options.projectStoreAdapter ?
            this.options.projectStoreAdapter : new ProjectStoreFactory(this.options);
        resources = this.options.resourcesAdapter ?
            this.options.resourcesAdapter : new ResourceFactory();
    }

    async addMemberToProject(projectId: string, user: UserModel): Promise<any> {
        try {
            if (user && user.email) {
                return await database.addMemberToProject(projectId, user);
            }
            throw new Error('User model miss required data');
        } catch (e) {
            throw e;
        }
    }

    async createBFastProject(project: ProjectModel): Promise<any> {
        try {
            project.members = [];
            const value = await database.insertProject(project);
            if (value && value.type === 'bfast' && value.parse && value.parse.appId && value.parse.masterKey) {
                return await this._deployProjectInCluster(value);
            } else if (value && value.type === 'ssm') {
                return await this._deployProjectInCluster(value);
            } else {
                throw {message: 'project type is undefined'};
            }
        } catch (reason) {
            throw reason
        }
    }

    async getUserProjects(uid: string, size?: number, skip?: number): Promise<any> {
        return database.getUserProjects(uid, size, skip);
    }

    async deleteUserProject(uid: string, projectId: string): Promise<any> {
        try {
            await database.deleteUserProject(uid, projectId);
        } catch (e) {
            throw e;
        }
        try {
            await this._removeProjectInCluster(projectId);
            return {message: 'Project deleted and removed'};
        } catch (e) {
            console.warn(e);
            return {message: 'Project deleted'};
        }
    }

    async patchProjectDetails(
        uid: string, projectId: string, data: { description?: string, name?: string }): Promise<any> {
        return database.patchProjectDetails(uid, projectId, data);
    }

    async getUserProject(uid: string, projectId: string) {
        return database.getUserProject(uid, projectId);
    }

    private async _removeProjectInCluster(projectId: string): Promise<any> {
        try {
            await shell.exec(
                `$docker stack rm ${projectId}`,
                {
                    env: {
                        docker: this.options.dockerSocket
                    }
                }
            );
            return 'Project removed in cluster';
        } catch (e) {
            throw {message: "Project fails to be removed from stack", reason: e.toString()};
        }
    }

    private async _deployProjectInCluster(project: ProjectModel): Promise<any> {
        project.fileUrl = resources.getComposeFile(project.type);
        try {
            await shell.exec(
                `$docker stack deploy -c ${project.fileUrl} ${project.projectId}`,
                {
                    env: {
                        projectId: project.projectId,
                        bucketName: project.projectId.toLowerCase(),
                        projectName: project.name,
                        userEmail: project.user.email,
                        appId: project.parse.appId,
                        masterKey: project.parse.masterKey,
                        docker: this.options.dockerSocket,
                        cluster: project.cluster ? project.cluster : 'bfast'
                    }
                });
            return project;
        } catch (reason) {
            try {
                // @ts-ignore
                await database.deleteUserProject(project.id ? project.id : '', project.projectId);
            } catch (e) {
                console.log(e);
            }
            // console.log(reason);
            throw {message: 'Project not created', reason: reason.toString()};
        }
    }
}
