export class OptionsConfig {
    mongoURL;
    redisHOST;
    devMode = false;
    dockerSocket;
    port = '3000';
    masterKey;

    /**
     *
     * @return {ShellAdapter}
     */
    shellAdapter(){};

    /**
     * @return {OrchestrationAdapter}
     */
    containerOrchAdapter(){};
}
