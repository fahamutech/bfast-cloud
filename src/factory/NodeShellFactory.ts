import {ShellAdapter, ShellOptions} from "../adapter/shell";

let _childProcess: any;

export class NodeShellFactory implements ShellAdapter {
    // private _childProcess: any;

    constructor() {
        _childProcess = require('child_process');
    }

    exec(cmd: string, options?: ShellOptions): Promise<any> {
        return new Promise((resolve, reject) => {
            _childProcess.exec(
                cmd,
                options ? options : {},
                (error: any, stdout: Buffer, stderr: Buffer) => {
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
