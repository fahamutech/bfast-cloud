import {ProjectModel} from "../model/project";
import {UserModel} from "../model/user";

export interface ProjectDatabaseAdapter {
    insertProject(project: ProjectModel): Promise<ProjectModel>;

    deleteProject(id: string, projectId: string): Promise<any>;

    getProjects(userId: string): Promise<ProjectModel[]>;
}


export interface UsersDatabaseAdapter {
    createUser(user: UserModel): Promise<any>;

    deleteUser(userId: string): Promise<any>;

    updateUserDetails(userId: string, data: object): Promise<any>;

    getUser(userId: string): Promise<any>;

    getAllUsers(size?: number, skip?: number ): Promise<any[]>;

    login(username: string, password: string): Promise<any>

    resetPassword(email: string): Promise<any>
}
