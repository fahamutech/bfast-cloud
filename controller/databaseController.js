const MongoClient = require('mongodb').MongoClient;

const DB_NAME='_BFAST_ADMIN';
const DB_HOST = process.env.mdbhost || 'mdb'
const mongoClient = new MongoClient(`mongodb://${DB_HOST}:27017/${DB_NAME}`, {useNewUrlParser: true});
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

    createProject(data){
        // console.log(data);
        return new Promise( async (resolve, reject)=>{
            if(data && 
                data.name && 
                data.projectId && 
                ( data.projectId !=='cloud' || data.projectId !=='console' || data.projectId !=='dashboard' ) &&
                data.description && 
                data.user){
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
                        isParse: data.isParse? data.isParse : false,
                        parse: ( data.parse && data.parse.appId && data.parse.masterKey ) ? data.parse: null,
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
        return new Promise(async (resolve, reject)=>{
            if(userId){
                try{
                    let conn;
                    if(!mongoClient.isConnected()){
                        conn = await mongoClient.connect();
                    }else{
                        conn = mongoClient;
                    }
                    const projectCollection = conn.db(DB_NAME).collection(DB_COLL.project);
                    const results = await projectCollection.find({'user.uid': userId}).toArray();
                    resolve(results);
                }catch(reason){
                    console.log(reason);
                    reject({message: reason.toString()});
                }
            }else{
                reject({message: 'Please provide a user id'});
            }
        });
    }

}

// initiate replica set
const _initiateRS =  function(){
    const repInterval = setInterval(async()=>{
        console.log('************initiate replica set******************');
        try{
            console.log('start to connect')
            let conn;
            if(mongoClient.isConnected()){
                conn = mongoClient;
                console.log('is connected');
            }else{
                conn = await mongoClient.connect();
                console.log('not connected');
            }

            console.log('start to call master');
            const isM = await conn.db().executeDbAdminCommand({isMaster: 1});
            // console.log(isM)
            if(isM && isM.ismaster){
                console.log('master exist');
                try{
                    await conn.db().executeDbAdminCommand({replSetReconfig: { host: "mdbrs1", priority: 0, votes: 0}});
                    await conn.db().executeDbAdminCommand({replSetReconfig: { host: "mdbrs2", priority: 0, votes: 0}});
                }catch(r1){
                    console.log(r1);
                }
            }else{
                console.log('master not exist');
                await conn.db().executeDbAdminCommand({replSetInitiate: {
                    "_id":"bfastRS",
                    "members": [
                        {"_id": 0, host: mdb},
                        {"_id": 1, host: mdbrs1, priority: 0, votes: 0},
                        {"_id": 2, host: mdbrs2, priority: 0, votes: 0}
                    ]
                }});
            }
            console.log('=============>>>>>done initiate replica set');
            clearInterval(repInterval);
            return;
        }catch(e){
            console.log(e);
            // console.log(`%%%############---->: ${e}`);
        }
    }, 10000);
}
_initiateRS();
