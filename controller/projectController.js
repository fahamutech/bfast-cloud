const DatabaseController = require('./databaseController').DatabaseController;
const path = require('path');
const process = require('child_process');
const _COMPOSE_FILE = path.join(__dirname, `../resources/dcompose.yml`);
const _PARSE_COMPOSE_FILE = path.join(__dirname, `../resources/parse-compose.yml`);
const database = new DatabaseController();

module.exports.ProjectController = class {
    constructor(){
    }

    createProject(project) {
        return new Promise((resolve, reject)=>{
            database.createProject({
                name: project.name,
                projectId: project.projectId,
                description: project.description,
                parse: project.parse,
                isParse: project.isParse,
                user: project.user
            }).then(value=>{
                // console.log(value);
                // create a project and its settings
                if(value && value.isParse && value.parse.appId && value.parse.masterKey){
                    value.fileUrl = _PARSE_COMPOSE_FILE;
                    this._deployParseProjectInCluster(value, resolve, reject);
                }else{
                    value.fileUrl = _COMPOSE_FILE;
                    this._deployProjectInCluster(value, resolve, reject);
                }
            }).catch(reason=>{
                reject(reason);
            });
        });
    }

    deleteProject(project) {
        
    }

    _deployProjectInCluster(project, resolve, reject) {
        process.exec(`$docker stack deploy -c ${project.fileUrl} ${project.projectId}`, {
            env: {
                projectId: project.projectId,
                docker: '/usr/local/bin/docker'
            }
        }, async function(error,stdout,stderr){
            if(error){
                console.log('erorr====>> ' + stderr);
                // delete created project
                try{
                    await database.deleteProject(project.id, project.projectId);
                    reject({message: 'Project not created', reason: stderr.toString()});
                }catch(e){
                    console.log(e);
                    reject({message: 'Project not created', reason: stderr.toString()});
                }
            }else{
                console.log(stdout.toString());
                resolve({message: 'Project created'});
            }
        });
    }

    _deployParseProjectInCluster(project,resolve,reject){
        process.exec(`$docker stack deploy -c ${project.fileUrl} ${project.projectId}`, {
            env: {
                projectId: project.projectId,
                projectName: project.name,
                userEmail: project.user.email,
                appId: project.parse.appId,
                masterKey: project.parse.masterKey,
                docker: '/usr/local/bin/docker'
            }
        }, async function(error,stdout,stderr){
            if(error){
                console.log('erorr====>> ' + stderr);
                // delete created project
                try{
                    await database.deleteProject(project.id, project.projectId);
                    reject({message: 'Project not created', reason: stderr.toString()});
                }catch(e){
                    console.log(e);
                    reject({message: 'Project not created', reason: stderr.toString()});
                }
            }else{
                console.log(stdout.toString());
                resolve({message: 'Project created'});
            }
        });
    }
    
}
