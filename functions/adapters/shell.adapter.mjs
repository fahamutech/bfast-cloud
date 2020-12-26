export class ShellAdapter {
    /**
     *
     * @param cmd {string} - command to execute
     * @param options {ShellOptions}
     * @return {Promise<*>}
     */
    async exec(cmd, options = {}) {

    }
}

export class ShellOptions {
    uid;
    gid;
    cwd;
    env;
    windowsHide;
    timeout;
    shell;
    maxBuffer;
    killSignal;
}
