export interface ShellAdapter {
    exec(cmd: string, options?: ShellOptions): Promise<any>;
}

export interface ShellOptions {
    uid?: number;
    gid?: number;
    cwd?: string;
    env?: { [key: string]: string | undefined; }; //NodeJS.ProcessEnv;
    windowsHide?: boolean;
    timeout?: number;
    shell?: string;
    maxBuffer?: number;
    killSignal?: string;
}
