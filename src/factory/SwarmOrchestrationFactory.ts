import {ContainerOrchestrationAdapter} from "../adapter/containerOrchestration";
import {Options} from "../config/Options";
import {ShellAdapter} from "../adapter/shell";
import {NodeShellFactory} from "./NodeShellFactory";

let shell: ShellAdapter;

export class SwarmOrchestrationFactory implements ContainerOrchestrationAdapter {

    constructor(private  options: Options) {
        shell = this.options.shellAdapter ?
            this.options.shellAdapter : new NodeShellFactory();
    }

    async cloudFunctionsDeploy(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${Boolean(force) ? '--force' : ''} ${projectId}_faas`);
            return {message: response};
        } catch (e) {
            throw {message: 'Fails to deploy cloud functions', reason: e.toString()};
        }
    }

    async cloudFunctionsAddEnv(projectId: string = '', envs: string[] = [], force: boolean = false): Promise<any> {
        try {
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
            const response = await shell.exec(
                `docker service update ${Boolean(force) ? '--force' : ''} ${envQuery} ${projectId}_faas`);
            return {message: response.toString()};
        } catch (e) {
            throw {message: "Fails to add environments to cloud functions", reason: e.toString()};
        }
    }

    async cloudFunctionsRemoveEnv(projectId: string = '', envs: string[] = [], force: boolean = false): Promise<any> {
        try {
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
            const response = await shell.exec(
                `docker service update ${Boolean(force) ? '--force' : ''} ${envQuery} ${projectId}_faas`);
            return {message: response.toString()};
        } catch (e) {
            throw {message: "Fails to remove environments to cloud functions", reason: e.toString()};
        }
    }

}
