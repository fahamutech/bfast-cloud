import {ShellAdapter, ShellOptions} from "../adapters/shell.adapter.mjs";

let _childProcess;

export class NodeShellFactory extends ShellAdapter {

    constructor() {
        super();
        _childProcess = require('child_process');
    }

    /**
     *
     * @param cmd {string}
     * @param options {ShellOptions}
     * @return {Promise<*>}
     */
    async exec(cmd, options){
        return new Promise((resolve, reject) => {
            _childProcess.exec(
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
