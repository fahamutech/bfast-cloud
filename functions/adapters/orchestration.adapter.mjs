import {ProjectModel} from '../models/project.model.mjs'

export class OrchestrationAdapter {

    /**
     *
     * @param project {ProjectModel}
     * @return {Promise<void>}
     */
    async functionsInstanceCreate(project) {

    }

    /**
     *
     * @param projectId {string}
     * @return {Promise<void>}
     */
    async functionsInstanceRemove(projectId) {

    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async functionsInstanceDeploy(projectId, force) {

    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async functionsInstanceAddEnv(projectId, envs, force) {
    }

    /**
     *
     * @param projectId {string}
     * @param domain {string}
     * @param force {boolean}
     * @return {Promise<void>}
     */
    async functionsInstanceAddDomain(projectId, domain, force) {
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async functionsInstanceRemoveDomain(projectId, force) {
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async functionsInstanceSwitchOn(projectId, force) {
    }

    /**
     *
     * @param projectId {string}
     * @param force {boolean}
     * @return {Promise<void>}
     */
    async functionsInstanceSwitchOff(projectId, force) {
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async functionsInstanceRemoveEnv(projectId, envs, force) {
    }

    /**
     *
     * @param project {ProjectModel}
     * @return {Promise<void>}
     */
    async databaseInstanceCreate(project) {

    }

    /**
     *
     * @param projectId {string}
     * @return {Promise<void>}
     */
    async databaseInstanceRemove(projectId) {

    }

    /**
     *
     * @param projectId {string}
     * @param image {string}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async databaseInstanceImage(projectId, image, force) {
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async databaseInstanceAddEnv(projectId, envs, force) {
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @return {Promise<*>}
     */
    async databaseInstanceRemoveEnv(projectId, envs, force) {
    }

}
