import {DockerAdapter} from "../adapters/docker";
import {Configurations} from "../config/configurations";

// const Docker = require('dockerode');
// const docker = new Docker();

export class DockerCmdFactory extends Configurations implements DockerAdapter {
    childProcess: any;

    constructor() {
        super();
        this.childProcess = require('child_process');
    }

    deployFaaSEngine(projectId: string, force: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this.childProcess.exec(
                `docker service update ${Boolean(force) ? '--force' : ''} ${projectId}_faas`,
                (error: any, stdout: any, stderr: any) => {
                    if (error) {
                        reject(stderr.toString());
                        return;
                    }
                    resolve(stdout.toString());
                });
        });
    }

    envAddToFaaSEngine(projectId: string = '', envs: string[] = [], force: boolean = false): Promise<any> {
        if (projectId.length < 1) {
            throw 'projectId required'
        }
        if (envs.length < 1) {
            throw 'at least one environment required';
        }
        let envQuery = '';
        envs.forEach(env => {
            envQuery = envQuery.concat(' --env-add ', env);
        });
        return new Promise((resolve, reject) => {
            this.childProcess.exec(
                `docker service update ${Boolean(force) ? '--force' : ''} ${envQuery} ${projectId}_faas`,
                (error: any, stdout: any, stderr: any) => {
                    if (error) {
                        reject(stderr.toString());
                        return;
                    }
                    resolve(stdout.toString());
                });
        });
    }

    envRemoveFromFaaSEngine(projectId: string = '', envs: string[] = [], force: boolean = false): Promise<any> {
        if (projectId.length < 1) {
            throw 'projectId required';
        }
        if (envs.length < 1) {
            throw 'at least one environment required';
        }
        let envQuery = '';
        envs.forEach(env => {
            envQuery = envQuery.concat(' --env-rm ', env);
        });
        return new Promise((resolve, reject) => {
            this.childProcess.exec(
                `docker service update ${Boolean(force) ? '--force' : ''} ${envQuery} ${projectId}_faas`,
                (error: any, stdout: any, stderr: any) => {
                    if (error) {
                        reject(stderr.toString());
                        return;
                    }
                    resolve(stdout.toString());
                });
        });
    }

}
