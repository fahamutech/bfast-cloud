module.exports.DockerMock = class {
    cloudFunctionsDeploy(projectId, force) {
        return new Promise((resolve, reject) => {
            resolve({message: 'done deploy functions'});
        })
    }

    cloudFunctionsAddEnv(projectId, envs, force) {
        return new Promise((resolve, reject) => {
            resolve({message: 'done add env in functions'})
        });
    }

    cloudFunctionsRemoveEnv(projectId, envs, force) {
        return new Promise((resolve, reject) => {
            resolve({message: 'done remove env in functions'})
        });
    }
};
