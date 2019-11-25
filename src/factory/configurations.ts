export abstract class Configurations {
    protected dockerSocket: string;
    protected DB_HOST: string;
    protected isDebug: string;

    protected constructor() {
        this.dockerSocket = process.env.dSocket || '/usr/local/bin/docker';
        this.isDebug = process.env.debug || "false";
        this.DB_HOST = process.env.mdbhost || 'mdb';
    }
}
