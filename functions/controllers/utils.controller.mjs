export class UtilsController {
    /**
     *
     * @param projectId {string}
     * @return {*}
     */
    static checkProjectId(projectId) {
        if (projectId.length < 1) {
            throw 'projectId required and can not be empty';
        } else {
            return projectId;
        }
    }
}
