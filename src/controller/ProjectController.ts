import {ProjectModel} from "../model/project";
import {ShellAdapter} from "../adapter/shell";
import {Options} from "../config/Options";
import {NodeShellFactory} from "../factory/NodeShellFactory";
import {ProjectStoreAdapter} from "../adapter/database";
import {ProjectStoreFactory} from "../factory/ProjectStoreFactory";
import {ResourcesAdapter} from "../adapter/resources";
import {ResourceFactory} from "../factory/ResourceFactory";

let shell: ShellAdapter;
let database: ProjectStoreAdapter;
let resources: ResourcesAdapter;

export class ProjectController {

    constructor(private options: Options) {
        shell = this.options.shellAdapter ?
            this.options.shellAdapter : new NodeShellFactory();
        database = this.options.projectStoreAdapter ?
            this.options.projectStoreAdapter : new ProjectStoreFactory(this.options);
        resources = this.options.resourcesAdapter ?
            this.options.resourcesAdapter : new ResourceFactory();
    }

    async createBFastProject(project: ProjectModel): Promise<any> {
        try {
            const value = await database.insertProject(project);
            if (value && value.type === 'bfast' && value.parse && value.parse.appId && value.parse.masterKey) {
                return await this._deployProjectInCluster(value);
            } else if (value && value.type === 'ssm') {
                return await this._deployProjectInCluster(value);
            } else {
                console.log(value);
                throw {message: 'project type is undefined'};
            }
        } catch (reason) {
            console.error(reason);
            throw {message: 'Fails to create project', reason: reason};
        }
    }

    async getUserProjects(uid: string, size?: number, skip?: number): Promise<any> {
        return database.getUserProjects(uid, size, skip);
    }

    async deleteUserProject(uid: string, projectId: string): Promise<any> {
        return database.deleteUserProject(uid, projectId);
    }

    async patchProjectDetails(
        uid: string, projectId: string, data: { description?: string, name?: string }): Promise<any> {
        return database.patchProjectDetails(uid, projectId, data);
    }

    async getUserProject(uid: string, projectId: string) {
        return database.getUserProject(uid, projectId);
    }

    private async _deployProjectInCluster(project: ProjectModel): Promise<any> {
        project.fileUrl = resources.getComposeFile(project.type);
        try {
            const value = await shell.exec(
                `$docker stack deploy -c ${project.fileUrl} ${project.projectId}`,
                {
                    env: {
                        projectId: project.projectId,
                        projectName: project.name,
                        userEmail: project.user.email,
                        appId: project.parse.appId,
                        masterKey: project.parse.masterKey,
                        docker: this.options.dockerSocket
                    }
                });
            console.log(value);
            return {message: 'Project created', project: project};
        } catch (reason) {
            try {
                // @ts-ignore
                await database.deleteUserProject(project.id ? project.id : '', project.projectId);
            } catch (e) {
                console.log(e);
            }
            console.log(reason);
            throw {message: 'Project not created', reason: reason.toString()};
        }
    }
}
