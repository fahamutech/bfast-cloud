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
     * @param envs {Array<string>}
     * @return {Promise<void>}
     */
    async databaseInstanceCreate(project, envs ) {

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
    async databaseInstanceUpdateImage(projectId, image, force) {
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @param daemon {boolean}
     * @return {Promise<*>}
     */
    async databaseInstanceAddEnv(projectId, envs, force, daemon) {
    }

    /**
     *
     * @param projectId {string}
     * @param envs {Array<string>}
     * @param force {boolean}
     * @param daemon {boolean}
     * @return {Promise<*>}
     */
    async databaseInstanceRemoveEnv(projectId, envs, force, daemon) {
    }

    /**
     * inspect instance
     * @param instanceId {string}
     * @return {Promise<*>}
     */
    async instanceInfo(instanceId) {
    }

    /**
     * get all physical instance running in cluster
     * @return {Promise<Array<string>>}
     */
    async instances(){
    }

    /**
     * remove running service in cluster
     * @param instanceId {string}
     * @return {Promise<any>}
     */
    async removeInstance(instanceId){

    }

}
