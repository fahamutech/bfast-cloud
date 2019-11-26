import {BFastControllers} from "../controller";

let projectRouter = require('express').Router();
let path = require('path');

/**
 * Get UI for manage projects
 */
projectRouter.get('/', function (req: any, res: any) {
    res.sendFile(path.join(__dirname, '../public/project/index.html'));
});

/**
 * Get all project of a specific user
 */
projectRouter.post('/all', function (request: any, respond: any) {
    BFastControllers.projects.getUserProjects(request.body.uid).then((value: any) => {
        respond.json(value);
    }).catch((reason: any) => {
        respond.status(404).json(reason);
    });
});

/**
 * create a new project
 */
projectRouter.post('/', function (request: any, respond: any) {
    const body = request.body;
    BFastControllers.projects.createProject(body).then((value: any) => {
        delete value.fileUrl;
        respond.json(value);
    }).catch((reason: any) => {
        respond.status(400).json(reason);
    });
});


projectRouter.delete('/delete/:id', function (request: any, respond: any) {
    const projectId = request.params.id;
    respond.status(200).json({projectId});
});

module.exports = projectRouter;

export class ProjectRouter{

}
