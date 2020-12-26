import {OrchestrationAdapter} from "../adapters/orchestration.adapter.mjs";
import {ProjectModel} from "../models/project.model";
import {ProjectStoreFactory} from "../factories/project-store.factory.mjs";

export class ProjectsController {

    /**
     *
     * @param database {ProjectStoreFactory}
     * @param orchestration {OrchestrationAdapter}
     */
    constructor(database, orchestration) {
        this.database = database;
        this.orchestration = orchestration;
    }

    /**
     *
     * @param projectId {string}
     * @param user {*}
     * @return {Promise<*>}
     */
    async addMemberToProject(projectId, user) {
        if (user && user.email) {
            return await this.database.addMemberToProject(projectId, user);
        }
        throw new Error('User model miss required data');
    }

    /**
     *
     * @param project {ProjectModel}
     * @return {Promise<*>}
     */
    async createBFastProject(project) {
        if (project &&
            project.projectId &&
            project.projectId !== '' &&
            project.name &&
            project.name !== '' &&
            project.parse &&
            project.parse.appId &&
            project.parse.appId !== '' &&
            project.parse.masterKey !== '') {
            project.members = [];
            if (!project.type || project.type === '') {
                project.type = 'bfast';
            }
            const value = await this.database.insertProject(project);
            Object.assign(project, value);
            return this._deployProjectInCluster(project);
            // if () {
            //
            // } else if (value && value.type === 'ssm') {
            //     return await this._deployProjectInCluster(value);
            // } else {
            //     throw {message: 'project type is undefined'};
            // }
        } else {
            throw {message: 'project object is not well defined'}
        }
    }

    /**
     *
     * @param uid {string}
     * @param size {number}
     * @param skip {number}
     * @return {Promise<*>}
     */
    async getUserProjects(uid, size, skip) {
        return this.database.getUserProjects(uid, size, skip);
    }

    /**
     *
     * @param uid {string}
     * @param projectId {string}
     * @return {Promise<{message: string}>}
     */
    async deleteUserProject(uid, projectId) {
        await this.database.deleteUserProject(uid, projectId);
        try {
            await this._removeProjectInCluster(projectId);
            return {message: 'Project deleted and removed'};
        } catch (e) {
            console.warn(e);
            return {message: 'Project deleted'};
        }
    }

    /**
     *
     * @param uid {string}
     * @param projectId {string}
     * @param data {{ description: string, name: string }}
     * @return {Promise<*>}
     */
    async patchProjectDetails(uid, projectId, data) {
        return this.database.patchProjectDetails(uid, projectId, data);
    }

    /**
     *
     * @param uid {string}
     * @param projectId {string}
     * @return {Promise<*>}
     */
    async getUserProject(uid, projectId) {
        return this.database.getUserProject(uid, projectId);
    }

    /**
     *
     * @param projectId {string}
     * @return {Promise<string>}
     * @private
     */
    async _removeProjectInCluster(projectId) {
        try {
            await this.orchestration.functionsInstanceRemove(projectId);
            await this.orchestration.databaseInstanceRemove(projectId);
            return 'Project removed in cluster';
        } catch (e) {
            throw {
                message: "Project fails to be removed from stack",
                reason: e && e.message ? e.message : e.toString()
            };
        }
    }

    /**
     *
     * @param project {ProjectModel}
     * @return {Promise<ProjectModel>}
     * @private
     */
    async _deployProjectInCluster(project) {
        try {
            await this.orchestration.databaseInstanceCreate(project);
            await this.orchestration.functionsInstanceCreate(project);
            return project;
        } catch (reason) {
            try {
                await this.database.deleteUserProject(project.id ? project.id : '', project.projectId);
            } catch (e) {
                console.warn(e && e.message ? e.message : e.toString(), 'remove project when deploy fails');
            }
            throw {
                message: 'Project not created',
                reason: reason && reason.message ? reason.message : reason.toString()
            };
        }
    }
}
