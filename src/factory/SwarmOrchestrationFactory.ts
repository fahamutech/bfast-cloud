import {ContainerOrchestrationAdapter} from "../adapters/containerOrchestration";
import {Options} from "../config/Options";
import {ShellAdapter} from "../adapters/shell";
import {NodeShellFactory} from "./NodeShellFactory";

export class SwarmOrchestrationFactory implements ContainerOrchestrationAdapter {

    private readonly shell: ShellAdapter;

    constructor(private readonly options: Options) {
        this.shell = this.options.shellAdapter ?
            this.options.shellAdapter : new NodeShellFactory();
    }

    async cloudFunctionsDeploy(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await this.shell.exec(
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
            const response = await this.shell.exec(
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
            const response = await this.shell.exec(
                `docker service update ${Boolean(force) ? '--force' : ''} ${envQuery} ${projectId}_faas`);
            return {message: response.toString()};
        } catch (e) {
            throw {message: "Fails to remove environments to cloud functions", reason: e.toString()};
        }
    }

}
