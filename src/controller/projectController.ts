import {ProjectModel} from "../model/project";
import {ShellAdapter} from "../adapters/shell";
import {ProjectDatabaseFactory} from "../factory/projectDatabaseFactory";
import {Options} from "../config/Options";

export class ProjectController extends ProjectDatabaseFactory {

    constructor(options: Options,
                private readonly shell: ShellAdapter) {
        super(options);
    }

    async createProject(project: ProjectModel): Promise<any> {
        try {
            const value = await this.insertProject(project);
            if (value && value.isParse === true && value.parse && value.parse.appId && value.parse.masterKey) {
                value.fileUrl = this.getParseComposePath();
                return await this._deployParseProjectInCluster(value);
            } else {
                // value.fileUrl = this._COMPOSE_FILE;
                // this._deploySpringProjectInCluster(value, resolve, reject);
                // reject('spring boot based project is not supported anymore');
                throw {message: 'spring boot based project is not supported anymore'};
            }
        } catch (reason) {
            console.error(reason);
            throw {message: 'Fails to create project', reason: reason};
        }
    }

    private async _deployParseProjectInCluster(project: ProjectModel): Promise<any> {
        try {
            const value = await this.shell.exec(`$docker stack deploy -c ${project.fileUrl} ${project.projectId}`, {
                env: {
                    projectId: project.projectId,
                    projectName: project.name,
                    userEmail: project.user.email,
                    appId: project.parse.appId,
                    masterKey: project.parse.masterKey,
                    docker: this.dockerSocket
                }
            });
            console.log(value);
            return {message: 'Project created'};
        } catch (reason) {
            try {
                // @ts-ignore
                await this.database.deleteUserProject(project.id ? project.id : '', project.projectId);
            } catch (e) {
                console.log(e);
            }
            console.log(reason);
            throw {message: 'Project not created', reason: reason.toString()};
        }
    }

}
