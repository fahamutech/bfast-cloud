import {ProjectModel} from "../model/project";
import {UserModel} from "../model/user";

export interface ProjectDatabaseAdapter {
    insertProject(project: ProjectModel): Promise<ProjectModel>;

    deleteUserProject(userId: string, projectId: string): Promise<any>;

    getUserProjects(userId: string, size?: number, skip?: number): Promise<ProjectModel[]>;

    getProject(objectId: string): Promise<ProjectModel>;

    getUserProject(userId: string, projectId: string): Promise<ProjectModel[]>;

    getAllProjects(size?: number, skip?: number): Promise<ProjectModel[]>;

    patchProjectDetails(userId: string, projectId: string, data: { description?: string, name?: string }): Promise<any>;

    /**
     * check if user is the owner of the project and return a project
     * @param userId {string} user id
     * @param projectId {string} project id
     */
    // need discussion upon name
    getOwnerProject(userId: string, projectId: string): Promise<any>;
}

export interface UsersDatabaseAdapter {
    createUser(user: UserModel): Promise<any>;

    deleteUser(userId: string): Promise<any>;

    updateUserDetails(userId: string, data: object): Promise<any>;

    getUser(userId: string): Promise<any>;

    getAllUsers(size?: number, skip?: number): Promise<any[]>;

    login(username: string, password: string): Promise<any>;

    requestResetPassword(email: string): Promise<any>;

    resetPassword(email: string, code: string, password: string): Promise<any>;

    getRole(userId: string): Promise<string>;
}
