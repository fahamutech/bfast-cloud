import {ProjectModel} from "../model/project";

export interface ProjectDatabaseAdapter {
    createProject(project: ProjectModel): Promise<ProjectModel>;

    deleteProject(id: string, projectId: string): Promise<any>;

    getProjects(userId: string): Promise<ProjectModel[]>;
}
