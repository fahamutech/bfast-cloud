export class Utils {
    static _checkProjectId(projectId: string): string {
        if (projectId.length < 1) {
            throw 'projectId required and can not be empty';
        } else {
            return projectId;
        }
    }
}
