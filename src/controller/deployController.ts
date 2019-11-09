const childProcess = require('child_process');

export class DeployController {
    constructor() {
    }

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
        })
    }
}
