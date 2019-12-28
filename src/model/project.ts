import {BusinessModel, UserModel} from "./user";

export interface ProjectModel {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    name: string;
    projectId: string;
    description: string;
    type: 'parse-server' | 'ssm';
    ssm: BusinessModel;
    isParse?: boolean;
    parse: { appId: string; masterKey: string; };
    members: UserModel[] | [];
    user: UserModel;
    fileUrl?: any
}
