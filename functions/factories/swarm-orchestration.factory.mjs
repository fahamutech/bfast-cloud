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
        // shell = this.options.shellAdapter ?
        //     this.options.shellAdapter : new NodeShellFactory();
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
        try {
            const response = await this.shell.exec(
                `/usr/local/bin/docker service update ${force ? '--force ' : ' '}  --label-add="traefik.frontend.rule"="Host:${projectId}-faas.bfast.fahamutech.com, ${domain}" ${projectId}_faas`
            );
            return response.toString();
        } catch (e) {
            throw {message: "Fails to add custom domain", reason: e.toString()};
        }
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<string>}
     */
    async functionsInstanceRemoveDomain(projectId, force) {
        try {
            const response = await this.shell.exec(
                `/usr/local/bin/docker service update ${force ? '--force' : ''} --label-add="traefik.frontend.rule=Host:${projectId}-faas.bfast.fahamutech.com" ${projectId}_faas`);
            return response.toString();
        } catch (e) {
            throw {message: "Fails to remove all custom domain", reason: e.toString()};
        }
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
     * @param projectId {string}
     * @param image {string}
     * @param force {boolean}
     * @return {Promise<string>}
     */
    async databaseInstanceUpdateImage(projectId, image, force) {
        let forceString = ' ';
        if (force) {
            forceString = '--force ';
        }
        const cmdString = `/usr/local/bin/docker service update ${forceString.toString()}  --image ${image}  ${projectId.toString()}_daas`;
        await this.shell.exec(
            cmdString.toString()
        );
        return "database instance image updated";
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @param daemon {boolean}
     * @return {Promise<{message: string}>}
     */
    async databaseInstanceAddEnv(projectId, envs, force, daemon) {
        if (projectId.length < 1) {
            throw {message: 'projectId required'}
        }
        if (Array.isArray(envs) && envs.length < 1) {
            throw {message: 'at least one environment required'};
        }
        let envQuery = '';
        envs.forEach(env => {
            envQuery = envQuery.concat(' --env-add ', env);
        });
        const response = await this.shell.exec(
            `/usr/local/bin/docker service update ${Boolean(daemon) === true ? '-d' : ''} ${Boolean(force) === true ? '--force' : ''} ${envQuery} ${projectId}_daas`);
        return {message: response.toString()};
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @param daemon {boolean}
     * @return {Promise<{message: string}>}
     */
    async databaseInstanceRemoveEnv(projectId, envs, force, daemon) {
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
        const response = await this.shell.exec(
            `/usr/local/bin/docker service update ${Boolean(daemon) === true ? '-d' : ''} ${Boolean(force) === true ? '--force' : ''} ${envQuery} ${projectId}_daas`);
        return {message: response.toString()};
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
            "--secret rsapub",
            "--secret rsapriv",
            "--label \"traefik.docker.network=bfastweb\"",
            "--label \"traefik.enable=true\"",
            "--label \"traefik.port=3000\"",
            "--label \"traefik.protocol=http\"",
            "--label \"traefik.frontend.rule=Host:${projectId}-faas.${cluster}.${hostDomain}\"",
            "--env \"APPLICATION_ID=${appId}\"",
            "--env \"PROJECT_ID=${projectId}\"",
            `--env \"MONGO_URL=mongodb://${project.parse.appId.toString().replace(new RegExp('[-]', 'ig'), '').trim()}:${project.parse.masterKey.toString().replace(new RegExp('[-]', 'ig'), '').trim()}@2.mongo.fahamutech.com:27018,2.mongo.fahamutech.com:27017,3.mongo.fahamutech.com:27017/${project.projectId}?authSource=admin&replicaSet=mdbRepl\"`,
            "--env \"PORT=3000\"",
            "--env \"PRODUCTION=1\"",
            envs ? envs.map(e => '--env \'' + e + '\'').join(' ') : ' ',
            "joshuamshana/bfastfunction:latest",
        ];
        if (dryRun === true) {
            // console.log(commands.join('\n'));
            console.log('-------dry run faas-----------');
            return;
        }
        return this.shell.exec(commands.join(' '), {
            env: {
                projectId: project.projectId,
                bucketName: project.projectId.toString().replace(new RegExp('[^\\w]', 'ig'), '').toLowerCase(),
                projectName: project.name,
                userEmail: project.user.email,
                appId: project.parse.appId,
                hostDomain: project.hostDomain ? project.hostDomain : 'fahamutech.com',
                masterKey: project.parse.masterKey,
                docker: this.options.dockerSocket,
                cluster: project.cluster ? project.cluster : 'bfast'
            }
        });
    }

    async databaseInstanceCreate(project, envs , dryRun) {
        const commands = [
            "/usr/local/bin/docker service create",
            "--name ${projectId}_daas",
            "--hostname ${projectId}_daas",
            "--network bfastweb",
            "--mode replicated",
            "--replicas 1",
            "--restart-condition any",
            "--restart-delay 5s",
            "--label \"traefik.docker.network=bfastweb\"",
            "--label \"traefik.enable=true\"",
            "--label \"traefik.port=3000\"",
            "--label \"traefik.protocol=http\"",
            "--label \"traefik.frontend.rule=Host:${projectId}-daas.${cluster}.${hostDomain}\"",
            "--secret s3endpoint",
            "--secret s3endpointUsEast1",
            "--secret s3accessKey",
            "--secret s3secretKey",
            "--secret rsapub",
            "--secret rsapriv",
            "--env \"APPLICATION_ID=${appId}\"",
            "--env \"PROJECT_ID=${projectId}\"",
            "--env \"MASTER_KEY=${masterKey}\"",
            `--env \"MONGO_URL=mongodb://${project.parse.appId.toString().replace(new RegExp('[-]', 'ig'), '').trim()}:${project.parse.masterKey.toString().replace(new RegExp('[-]', 'ig'), '').trim()}@2.mongo.fahamutech.com:27018,2.mongo.fahamutech.com:27017,3.mongo.fahamutech.com:27017/${project.projectId}?authSource=admin&replicaSet=mdbRepl\"`,
            "--env \"PORT=3000\"",
            "--env \"PRODUCTION=1\"",
            "--env \"GIT_USERNAME=joshuamshana\"",
            "--env \"GIT_CLONE_URL=https://github.com/fahamutech/bfast-database.git\"",
            "--env \"PRODUCTION=1\"",
            "--env \"MODE=npm\"",
            "--env \"NPM_TAR=bfast-database\"",
            "--env \"MOUNT_PATH=/\"",
            "--env \"S3_BUCKET=bfast-${bucketName}\"",
            "--env \"S3_ACCESS_KEY=/run/secrets/s3accessKey\"",
            "--env \"S3_SECRET_KEY=/run/secrets/s3secretKey\"",
            "--env \"S3_ENDPOINT=/run/secrets/s3endpointUsEast1\"",
            envs ? envs.map(e => '--env \'' + e + '\'').join(' ') : ' ',
            "joshuamshana/bfastfunction:latest",
        ]
        if (dryRun === true) {
            // console.log(commands.join('\n'));
            console.log('-----------dry run daas----------');
            return;
        }
        return await this.shell.exec(commands.join(' '), {
            env: {
                projectId: project.projectId,
                bucketName: project.projectId.toString().replace(new RegExp('[^\\w]', 'ig'), '').toLowerCase(),
                projectName: project.name,
                userEmail: project.user.email,
                appId: project.parse.appId,
                hostDomain: project.hostDomain ? project.hostDomain.toString().toLowerCase() : 'fahamutech.com',
                masterKey: project.parse.masterKey,
                docker: this.options.dockerSocket,
                cluster: project.cluster ? project.cluster.toString().toLowerCase() : 'bfast'
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

    async databaseInstanceRemove(projectId) {
        return this.shell.exec(`/usr/local/bin/docker service rm ${projectId}_daas`, {
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
