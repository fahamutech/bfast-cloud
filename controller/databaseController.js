const MongoClient = require('mongodb').MongoClient;

const DB_NAME='_BFAST_ADMIN';
const DB_HOST = process.env.mdbhost || 'mdb'
const mongoClient = new MongoClient(`mongodb://${DB_HOST}:27017/${DB_NAME}`, {useNewUrlParser: true, useUnifiedTopology: true});
const DB_COLL = {
    user: '_User',
    project: '_Project'
}

module.exports.DatabaseController = class {
    test(){
        mongoClient.connect().then(conn=>{
            console.log(conn);
        }).catch(reason=>{
            console.log(reason);
        });
    }

    //******user management methods*****//
    createUser(data){
        if(collection && data){
            mongoClient.connect().then(conn=>{
                conn.db(DB_NAME).collection(DB_COLL.user).insertOne(data)
            }).catch(reason=>{
                return Promise.reject(reason);
            })
        }else{
            return Promise.reject({message: 'Please provide enough information'});
        }
    }


    //****project method*****//
    createProject(data){
        // console.log(data);
        return new Promise( async (resolve, reject)=>{
            if(data && data.name && data.projectId && data.description && data.user && data.fileUrl){
                try{
                    // establish connection
                    let conn; 
                    if(!mongoClient.isConnected()) {
                       conn = await mongoClient.connect();
                    }else{
                        conn = mongoClient;
                    }
                    // console.log(conn);
                    const projectColl = conn.db(DB_NAME).collection(DB_COLL.project);
                   // inser data
                    const result = await projectColl.insertOne({
                        name: data.name,
                        projectId: data.projectId,
                        description: data.decription,
                        user: data.user,
                        compose: data.fileUrl,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    // add indexes
                    const pNameIndex = await projectColl.indexExists('projectId');
                    if(!pNameIndex){
                        await projectColl.createIndex({projectId: 1}, {unique: true});
                    }
                    data.id = result.insertedId;
                    resolve(data);
                    // return Promise.resolve();
                }catch(reason){
                    console.log(reason.toString());
                    let message;
                    if(reason.code && reason.code == 11000){
                        const date = Date.now().toString();
                        const sp = data.name + date.substring(9, date.length);
                        message = `Project id you suggest is already in use, maybe try this : ${sp}, or try different project id` 
                    }else{
                        message = reason.toString();
                    }
                    reject({message: message});
                }
            }else{
                reject({message:'Please provide enough information about your project'});
            }
        })
    }

    deleteProject(id, projectId){
        return new Promise(async (resolve, reject)=>{
            if(id && projectId){
                try{
                    let conn;
                    if(!mongoClient.isConnected()){
                        conn = await mongoClient.connect();
                    }else{
                        conn = mongoClient;
                    }
                    const projectCollection = conn.db(DB_NAME).collection(DB_COLL.project);
                    const result = await projectCollection.findOneAndDelete({projectId: projectId, _id: id});
                    console.log('project delete id : '+ result.value._id);
                    resolve(result);
                }catch(reason){
                    console.log(reason);
                    reject({message: reason.toString()});
                }
            }else{
                reject({message: 'Please provide project id and object id'});
            }
        });
    }

    getProjectsOfUser(userId){
        return new Promise((resolve, reject)=>{
            if(userId){
                
            }
        });
    }

}
