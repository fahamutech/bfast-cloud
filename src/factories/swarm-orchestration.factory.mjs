import {OrchestrationAdapter} from "../adapters/orchestration.adapter.mjs";
import {OptionsConfig} from "../configs/options.config.mjs";
import {ShellAdapter} from "../adapters/shell.adapter.mjs";

export class SwarmOrchestrationFactory extends OrchestrationAdapter {

    /**
     *
     * @param shell {ShellAdapter}
     * @param options {OptionsConfig}
     */
    constructor(shell, options) {
        super();
        this.options = options;
        this.shell = shell;
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<{message: *}>}
     */
    async functionsInstanceDeploy(projectId, force) {
        try {
            const response = await this.shell.exec(
                `/usr/local/bin/docker service update ${Boolean(force) ? '--force' : ''} ${projectId}_faas`);
            return {message: response};
        } catch (e) {
            throw {message: 'Fails to deploy cloud functions', reason: e.toString()};
        }
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @return {Promise<{message: string}>}
     */
    async functionsInstanceAddEnv(projectId = '', envs = [], force = false) {
        if (projectId.length < 1) {
            throw {message: "Fails to add environments to cloud functions", reason: 'projectId required'}
        }
        if (envs.length < 1) {
            throw {
                message: "Fails to add environments to cloud functions",
                reason: 'at least one environment required'
            };
        }
        let envQuery = '';
        envs.forEach(env => {
            envQuery = envQuery.concat(' --env-add ', env);
        });
        const response = await this.shell.exec(
            `/usr/local/bin/docker service update ${Boolean(force) ? '--force' : ''} ${envQuery} ${projectId}_faas`);
        return {message: response.toString()};
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @return {Promise<{message: string}>}
     */
    async functionsInstanceRemoveEnv(projectId = '', envs = [], force = false) {
        if (projectId.length < 1) {
            throw {message: "Fails to remove environments to cloud functions", reason: 'projectId required'};
        }
        if (envs.length < 1) {
            throw {
                message: "Fails to remove environments to cloud functions",
                reason: 'at least one environment required'
            };
        }
        let envQuery = '';
        envs.forEach(env => {
            envQuery = envQuery.concat(' --env-rm ', env);
        });
        const response = await this.shell.exec(
            `/usr/local/bin/docker service update ${Boolean(force) ? '--force' : ''} ${envQuery} ${projectId}_faas`);
        return {message: response.toString()};
    }

    /**
     *
     * @param projectId {string}
     * @param domain {string}
     * @param force {boolean}
     * @return {Promise<string>}
     */
    async functionsInstanceAddDomain(projectId, domain, force) {
        // try {
        //     const response = await this.shell.exec(
        //         `/usr/local/bin/docker service update ${force ? '--force ' : ' '}  --label-add="traefik.frontend.rule"="Host:${projectId}-faas.bfast.mraba.co.tz, ${domain}" ${projectId}_faas`
        //     );
        //     return response.toString();
        // } catch (e) {
        throw {message: "not supported"};
        // }
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<string>}
     */
    async functionsInstanceRemoveDomain(projectId, force) {
        // try {
        //     const response = await this.shell.exec(
        //         `/usr/local/bin/docker service update ${force ? '--force' : ''} --label-add="traefik.frontend.rule=Host:${projectId}-faas.bfast.mraba.co.tz" ${projectId}_faas`);
        //     return response.toString();
        // } catch (e) {
        //     throw {message: "Fails to remove all custom domain", reason: e.toString()};
        // }
        throw {message: "not supported"};
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<string>}
     */
    async functionsInstanceSwitchOff(projectId, force) {
        try {
            const response = await this.shell.exec(
                `/usr/local/bin/docker service update ${force ? '--force' : ''} --replicas=0 ${projectId}_faas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to switch off dashboard", reason: e.toString()};
        }
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<string>}
     */
    async functionsInstanceSwitchOn(projectId, force) {
        try {
            const response = await this.shell.exec(
                `/usr/local/bin/docker service update ${force ? '--force' : ''} --replicas=1 ${projectId}_faas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to switch off dashboard", reason: e.toString()};
        }
    }

    /**
     *
     * @param project {ProjectModel}
     * @param envs {Array<string>}
     * @param dryRun {boolean}
     * @return {Promise<*>}
     */
    async functionsInstanceCreate(project, envs, dryRun) {
        const commands = [
            "/usr/local/bin/docker service create",
            "--name ${projectId}_faas",
            "--hostname ${projectId}_faas",
            "--network bfastweb",
            "--mode replicated",
            "--replicas 0",
            "--restart-condition any",
            "--restart-delay 5s",
            "--label \"traefik.docker.network=bfastweb\"",
            "--label \"traefik.enable=true\"",
            "--label \"traefik.http.services.${projectId}-faas.loadbalancer.server.port=3000\"",
            "--label \"traefik.http.routers.${projectId}-faas.rule=Host(\\`${projectId}-faas.${cluster}.${hostDomain}\\`,\\`${projectId}.api.${hostDomain}\\`)\"",
            "--label \"traefik.http.routers.${projectId}-faas.tls=true\"",
            "--label \"traefik.http.routers.${projectId}-faas.tls.certresolver=le\"",
            "--label \"traefik.http.services.${projectId}-faas.loadbalancer.sticky.cookie=true\"",
            "--env \"PROJECT_ID=${projectId}\"",
            "--env \"PORT=3000\"",
            "--env \"PRODUCTION=1\"",
            envs ? envs.map(e => '--env \'' + e + '\'').join(' ') : ' ',
            "joshuamshana/bfastfunction:latest",
        ];
        if (dryRun === true) {
            console.log('-------dry run faas-----------');
            return;
        }
        return this.shell.exec(commands.join(' '), {
            env: {
                projectId: project.projectId,
                projectName: project.name,
                userEmail: project.user.email,
                appId: project.parse.appId,
                hostDomain: project.hostDomain ? project.hostDomain : 'mraba.co.tz',
                masterKey: project.parse.masterKey,
                docker: this.options.dockerSocket,
                cluster: project.cluster ? project.cluster : 'bfast'
            }
        });
    }

    async functionsInstanceRemove(projectId) {
        return this.shell.exec(`/usr/local/bin/docker service rm ${projectId}_faas`, {
            env: {
                docker: this.options.dockerSocket
            }
        });
    }

    async instanceInfo(instanceId) {
        const answer = await this.shell.exec(`/usr/local/bin/docker service inspect ${instanceId}`, {
            env: {
                docker: this.options.dockerSocket
            }
        });
        return JSON.parse(answer.toString().trim());
    }

    /**
     *
     * @param dryRun {boolean}
     * @return {Promise<string[]>}
     */
    async instances(dryRun) {
        // if (dryRun === true)
        const answer = await this.shell.exec("/usr/local/bin/docker service ls | awk '{print $2}'", {
            env: {
                docker: this.options.dockerSocket
            }
        });
        return answer.toString()
            .split('\n')
            .filter(t => t.toString().includes('_daas') || t.toString().includes('_faas'))
            .map(x => x.trim());

    }

    async removeInstance(instanceId) {
        return this.shell.exec(`/usr/local/bin/docker service rm ${instanceId}`, {
            env: {
                docker: this.options.dockerSocket
            }
        });
    }
}
