import {ProjectModel} from "../model/project";
import {ProjectDatabaseAdapter} from "../adapters/database";
import {ProjectConfigurations} from "../config/projectConfigurations";
import {ShellAdapter} from "../adapters/shell";

export class ProjectController extends ProjectConfigurations {

    constructor(private readonly database: ProjectDatabaseAdapter,
                private readonly shell: ShellAdapter) {
        super();
    }

    getUserProjects(uid: string): Promise<any> {
        return this.database.getProjectsOfUser(uid);
    }

    async createProject(project: ProjectModel): Promise<any> {
        try {
            const value = await this.database.insertProject(project);
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

    deleteUserProject(userId: string, projectId: string): Promise<any> {
        //  try {
        //  if (project && project.id && project.projectId) {
        return this.database.deleteUserProject(userId, projectId);
        //     // } else {
        //     throw {message: 'please provide enough information'};
        //     //}
        // } catch (e) {
        //     console.error(e);
        //     throw {message: 'Project not deleted', reason: e.toString()}
        // }
    }

    getUserProject(userId: string, projectId: string): Promise<any> {
        return this.database.getUserProject(userId, projectId);
    }

    // private _deploySpringProjectInCluster(project: any, resolve: any, reject: any) {
    //     process.exec(`$docker stack deploy -c ${project.fileUrl} ${project.projectId}`, {
    //         env: {
    //             projectId: project.projectId,
    //             docker: this.dockerSocket
    //         }
    //     }, async (error, stdout, stderr) => {
    //         if (error) {
    //             console.log('error ====>> ' + stderr);
    //             // delete created project
    //             try {
    //                 await this.database.deleteProject(project.id, project.projectId);
    //                 reject({message: 'Project not created', reason: stderr.toString()});
    //             } catch (e) {
    //                 console.log(e);
    //                 reject({message: 'Project not created', reason: stderr.toString()});
    //             }
    //         } else {
    //             resolve({message: 'Project created'});
    //         }
    //     });
    // }

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
                await this.database.deleteUserProject(project.id, project.projectId);
            } catch (e) {
                console.log(e);
            }
            console.log(reason);
            throw {message: 'Project not created', reason: reason.toString()};
        }
    }

}
