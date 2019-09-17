const DatabaseController = require('./databaseController').DatabaseController;
const path = require('path');
const process = require('child_process');
let _COMPOSE_FILE = path.join(__dirname, `../resources/dcompose.yml`);
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
                user: project.user,
                fileUrl: _COMPOSE_FILE
            }).then(value=>{
                // createa a project and its settings
                this._createProjectInCluster(value, resolve, reject)
            }).catch(reason=>{
                reject(reason);
            });
        });
    }

    deleteProject(project) {
        
    }

    _createProjectInCluster(project, resolve, reject) {
        // console.log(project);
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
    
}
