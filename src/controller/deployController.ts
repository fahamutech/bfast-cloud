const childProcess = require('child_process');

/**
 * @deprecated Since v0.2.0 and will be removed in v1.0.0. Use FunctionsController class instead
 */
export class DeployController {
    constructor() {
    }

    /**
     * @deprecated Since v0.2.0 and will be removed in v1.0.0 use <code>FunctionsController#deploy</code> instead
     * @param projectId {String}
     * @param force {Boolean} force restart of a faas service
     */
    deployFunctions(projectId: string, force: boolean = true) {
        return new Promise((resolve, reject) => {
            childProcess.exec(`docker service update ${Boolean(force) ? '--force' : ''} ${projectId}_faas`,
                (error: any, stdout: any, stderr: any) => {
                    if (error) {
                        reject(stderr.toString());
                        return;
                    }
                    resolve(stdout.toString());
                }
            );
        });
    }
}
