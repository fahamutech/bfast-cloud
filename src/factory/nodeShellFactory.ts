import {ShellAdapter, ShellOptions} from "../adapters/shell";

export class NodeShellFactory implements ShellAdapter {
    private _childProcess: any;

    constructor() {
        this._childProcess = require('child_process');
    }

    exec(cmd: string, options: ShellOptions): Promise<any> {
        return new Promise((resolve, reject) => {
            this._childProcess.exec(cmd, options, (error: any, stdout: Buffer, stderr: Buffer) => {
                if (error) {
                    reject({message: stderr.toString(), error: error.toString()});
                } else {
                    resolve({message: stdout.toString()});
                }
            });
        });
    }

}
