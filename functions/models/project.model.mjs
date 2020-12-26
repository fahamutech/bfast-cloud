export class ProjectModel {
    hostDomain = 'fahamutech.com';
    id;
    createdAt = new Date();
    updatedAt = new Date();
    name;
    projectId;
    description;
    type = 'bfast';
    isParse;
    parse = {appId: null, masterKey: null};
    members = [];
    user;
    fileUrl;
    cluster = 'bfast';
}
