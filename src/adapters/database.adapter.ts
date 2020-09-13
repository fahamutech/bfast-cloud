import {Collection, Db, ObjectID} from "mongodb";
import {UserModel} from "../models/user.model";
import {ProjectModel} from "../models/project.model";

export interface DatabaseAdapter {
    getDatabase(name: string): Promise<Db>;

    collection(collectionName: string): Promise<Collection>;

    getObjectId(id: string): ObjectID;

}

export interface ProjectStoreAdapter {
    collectionName: string;

    insertProject(project: ProjectModel): Promise<ProjectModel>;

    addMemberToProject(projectId: string, user: UserModel): Promise<ProjectModel>;

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

export interface UsersStoreAdapter {
    collectionName: string;

    createUser(user: UserModel): Promise<any>;

    createAdmin(user: UserModel): Promise<any>;

    deleteUser(userId: string): Promise<any>;

    updateUserDetails(userId: string, data: UserModel): Promise<UserModel>;

    getUser(userId: string): Promise<UserModel>;

    getAllUsers(size?: number, skip?: number): Promise<any[]>;

    login(username: string, password: string): Promise<any>;

    requestResetPassword(email: string): Promise<any>;

    resetPassword(code: string, password: string): Promise<any>;

    getRole(userId: string): Promise<any>;
}
