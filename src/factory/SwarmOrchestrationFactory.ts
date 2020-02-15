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

    /**
     * switch bfast dashboard component
     * @param projectId {string}
     * @param force {boolean}
     */
    async cloudDashboardSwitchOff(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force' : ''} --replicas=0 ${projectId}_dashboard`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to switch off dashboard", reason: e.toString()};
        }
    }

    async cloudDashboardSwitchOn(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force' : ''} --replicas=1 ${projectId}_dashboard`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to switch off dashboard", reason: e.toString()};
        }
    }

    async cloudFunctionAddDomain(projectId: string, domain: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force' : ''} --label-add="traefik.frontend.rule=Host:${projectId}-daas.bfast.fahamutech.com,${domain}.bfast.fahamutech.com" ${projectId}_daas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to add custom domain", reason: e.toString()};
        }
    }

    async cloudFunctionRemoveDomain(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force' : ''} --label-add="traefik.frontend.rule=Host:${projectId}-daas.bfast.fahamutech.com" ${projectId}_daas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to remove all custom domain", reason: e.toString()};
        }
    }


    async cloudFunctionSwitchOff(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force' : ''} --replicas=0 ${projectId}_faas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to switch off dashboard", reason: e.toString()};
        }
    }

    async cloudFunctionSwitchOn(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force' : ''} --replicas=1 ${projectId}_faas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to switch off dashboard", reason: e.toString()};
        }
    }

    async liveQueryClasses(projectId: string, classes: string[], force: boolean): Promise<any> {
        try {
            let classesString = '';
            classes.forEach(table => {
                classesString = classesString + "\"" + table + "\",";
            });
            const response = await shell.exec(
                'docker service update'+ force ? '--force ' : ' '+ ' --env-add PARSE_SERVER_LIVE_QUERY={"classNames":['+classesString+']} '+ projectId + '_daas'
            );
            return response.toString();
        } catch (e) {
            throw {message: "Fails to add classes to realtime engine", reason: e.toString()};
        }
    }

}
