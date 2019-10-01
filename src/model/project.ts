import {UserModel} from "./user";

export interface ProjectModel {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    name: string;
    projectId: string;
    description: string;
    type?: 'spring' | 'parse';
    isParse?: boolean;
    parse: { appId: string; masterKey: string; };
    members: UserModel[] | [];
    user: UserModel;
}
