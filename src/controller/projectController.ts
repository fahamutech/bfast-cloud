import {DatabaseController} from './databaseController'
import * as path from 'path'
import * as process from 'child_process'
import {ProjectModel} from "../model/project";

export class ProjectController {
    private _COMPOSE_FILE = path.join(__dirname, `../compose/spring-compose.yml`);
    private _PARSE_COMPOSE_FILE = path.join(__dirname, `../compose/parse-compose.yml`);

    constructor(private readonly database: DatabaseController) {
    }

    createProject(project: ProjectModel) {
        return new Promise((resolve, reject) => {
            this.database.createProject(project).then((value: ProjectModel) => {
                if (value && value.isParse && value.parse.appId && value.parse.masterKey) {
                    // @ts-ignore
                    value.fileUrl = this._PARSE_COMPOSE_FILE;
                    this._deployParseProjectInCluster(value, resolve, reject);
                } else {
                    // @ts-ignore
                    value.fileUrl = this._COMPOSE_FILE;
                    this._deployProjectInCluster(value, resolve, reject);
                }
            }).catch((reason: any) => {
                reject(reason);
            });
        });
    }

    deleteProject(project: any) {

    }

    private _deployProjectInCluster(project: any, resolve: any, reject: any) {
        process.exec(`$docker stack deploy -c ${project.fileUrl} ${project.projectId}`, {
            env: {
                projectId: project.projectId,
                docker: '/usr/local/bin/docker'
            }
        }, async (error, stdout, stderr) => {
            if (error) {
                console.log('erorr====>> ' + stderr);
                // delete created project
                try {
                    await this.database.deleteProject(project.id, project.projectId);
                    reject({message: 'Project not created', reason: stderr.toString()});
                } catch (e) {
                    console.log(e);
                    reject({message: 'Project not created', reason: stderr.toString()});
                }
            } else {
                console.log(stdout.toString());
                resolve({message: 'Project created'});
            }
        });
    }

    private _deployParseProjectInCluster(project: any, resolve: any, reject: any) {
        process.exec(`$docker stack deploy -c ${project.fileUrl} ${project.projectId}`, {
            env: {
                projectId: project.projectId,
                projectName: project.name,
                userEmail: project.user.email,
                appId: project.parse.appId,
                masterKey: project.parse.masterKey,
                docker: '/usr/local/bin/docker'
            }
        }, async (error, stdout, stderr) => {
            if (error) {
                console.log('erorr====>> ' + stderr);
                // delete created project
                try {
                    await this.database.deleteProject(project.id, project.projectId);
                    reject({message: 'Project not created', reason: stderr.toString()});
                } catch (e) {
                    console.log(e);
                    reject({message: 'Project not created', reason: stderr.toString()});
                }
            } else {
                console.log(stdout.toString());
                resolve({message: 'Project created'});
            }
        });
    }

}
