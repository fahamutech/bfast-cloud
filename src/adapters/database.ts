import {ProjectModel} from "../model/project";
import {UserModel} from "../model/user";

export interface ProjectDatabaseAdapter {
    insertProject(project: ProjectModel): Promise<ProjectModel>;

    deleteUserProject(userId: string, projectId: string): Promise<any>;

    getProjectsOfUser(userId: string): Promise<ProjectModel[]>;

    getProject(objectId: string): Promise<ProjectModel>;

    getUserProject(userId: string, projectId: string): Promise<ProjectModel[]>

    getAllProjects(size?: number, skip?: number): Promise<ProjectModel[]>
}


export interface UsersDatabaseAdapter {
    createUser(user: UserModel): Promise<any>;

    deleteUser(userId: string): Promise<any>;

    updateUserDetails(userId: string, data: object): Promise<any>;

    getUser(userId: string): Promise<any>;

    getAllUsers(size?: number, skip?: number): Promise<any[]>;

    login(username: string, password: string): Promise<any>;

    resetPassword(email: string): Promise<any>;

    getRole(userId: string): Promise<string>;
}
