import {UserModel} from "./user.model";

export interface ProjectModel {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    name: string;
    projectId: string;
    description: string;
    type: 'bfast' | 'ssm';
    isParse?: boolean;
    parse: { appId: string; masterKey: string; };
    members: UserModel[] | [];
    user: UserModel;
    fileUrl?: any
}
