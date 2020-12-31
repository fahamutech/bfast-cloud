import {ShellAdapter, ShellOptions} from "../adapters/shell.adapter.mjs";
import {exec} from 'child_process';

export class NodeShellFactory extends ShellAdapter {

    constructor() {
        super();
    }

    /**
     *
     * @param cmd {string}
     * @param options {ShellOptions}
     * @return {Promise<*>}
     */
    async exec(cmd, options) {
        return new Promise((resolve, reject) => {
            exec(
                cmd,
                options ? options : {},
                (error, stdout, stderr) => {
                    if (error) {
                        console.log(error);
                        reject(stderr.toString());
                    } else {
                        resolve(stdout.toString());
                    }
                });
        });
    }

}
