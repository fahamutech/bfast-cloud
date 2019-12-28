import {Options} from "./Options";

export abstract class Configurations {
    protected dockerSocket: string;
    protected DB_HOST: string;
    protected isDebug: string;

    protected constructor(options: Options) {
        this.dockerSocket = options.dockerSocket; // process.env.dSocket || '/usr/local/bin/docker';
        this.isDebug = options.isDebug; // process.env.debug || "false";
        this.DB_HOST = options.DB_HOST; // process.env.mdbhost || 'mdb';
    }

    // abstract getComposeFile(filename: string): string;
}
