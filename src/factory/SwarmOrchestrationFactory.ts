import {NodeShellFactory} from "./NodeShellFactory";
import {ShellAdapter} from "../adapters/shell.adapter";
import {OrchestrationAdapter} from "../adapters/orchestration.adapter";
import {BfastConfig} from "../configs/bfast.config";

let shell: ShellAdapter;

export class SwarmOrchestrationFactory implements OrchestrationAdapter {

    constructor(private  options: BfastConfig) {
        shell = this.options.shellAdapter ?
            this.options.shellAdapter : new NodeShellFactory();
    }

    async functionsInstanceDeploy(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${Boolean(force) ? '--force' : ''} ${projectId}_faas`);
            return {message: response};
        } catch (e) {
            throw {message: 'Fails to deploy cloud functions', reason: e.toString()};
        }
    }

    async functionsInstanceAddEnv(projectId: string = '', envs: string[] = [], force: boolean = false): Promise<any> {
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

    async functionsInstanceRemoveEnv(projectId: string = '', envs: string[] = [], force: boolean = false): Promise<any> {
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

    async functionsInstanceAddDomain(projectId: string, domain: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force ' : ' '}  --label-add="traefik.frontend.rule"="Host:${projectId}-faas.bfast.fahamutech.com, ${domain}" ${projectId}_faas`
            );
            return response.toString();
        } catch (e) {
            throw {message: "Fails to add custom domain", reason: e.toString()};
        }
    }

    async functionsInstanceRemoveDomain(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force' : ''} --label-add="traefik.frontend.rule=Host:${projectId}-faas.bfast.fahamutech.com" ${projectId}_faas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to remove all custom domain", reason: e.toString()};
        }
    }

    async functionsInstanceSwitchOff(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force' : ''} --replicas=0 ${projectId}_faas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to switch off dashboard", reason: e.toString()};
        }
    }

    async functionsInstanceSwitchOn(projectId: string, force: boolean): Promise<any> {
        try {
            const response = await shell.exec(
                `docker service update ${force ? '--force' : ''} --replicas=1 ${projectId}_faas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to switch off dashboard", reason: e.toString()};
        }
    }

    async databaseInstanceImage(projectId: string, image: string, force: boolean): Promise<string> {
        let forceString = ' ';
        if (force) {
            forceString = '--force ';
        }
        const cmdString = `docker service update ${forceString.toString()}  --image ${image}  ${projectId.toString()}_daas`;
        await shell.exec(
            cmdString.toString()
        );
        return "database instance image updated";
    }

    async databaseInstanceAddEnv(projectId: string, envs: string[], force: boolean): Promise<any> {
        if (projectId.length < 1) {
            throw {message: 'projectId required'}
        }
        if (envs.length < 1) {
            throw {message: 'at least one environment required'};
        }
        let envQuery = '';
        envs.forEach(env => {
            envQuery = envQuery.concat(' --env-add ', env);
        });
        const response = await shell.exec(
            `docker service update ${Boolean(force) ? '--force' : ''} ${envQuery} ${projectId}_daas`);
        return {message: response.toString()};
    }

    async databaseInstanceRemoveEnv(projectId: string, envs: string[], force: boolean): Promise<any> {
        if (projectId.length < 1) {
            throw {message: "projectId required"};
        }
        if (envs.length < 1) {
            throw {message: 'at least one environment required'};
        }
        let envQuery = '';
        envs.forEach(env => {
            envQuery = envQuery.concat(' --env-rm ', env);
        });
        const response = await shell.exec(
            `docker service update ${Boolean(force) ? '--force' : ''} ${envQuery} ${projectId}_daas`);
        return {message: response.toString()};
    }

}
