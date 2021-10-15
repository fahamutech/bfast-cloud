export class OptionsConfig {
    databaseURI;
    devMode = false;
    dockerSocket;
    port = '3000';
    projectId;
    applicationId;
    masterKey;

    /**
     *
     * @return {ShellAdapter}
     */
    shellAdapter() {
    };

    /**
     * @return {OrchestrationAdapter}
     */
    containerOrchAdapter() {
    };
}
