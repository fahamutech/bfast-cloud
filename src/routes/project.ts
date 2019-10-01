let projectRouter = require('express').Router();
let cli = require('../cli').Cli;
let path = require('path');

/**
 * Get user interface for manage projects
 */
projectRouter.get('/', function (req: any, res: any) {
    res.sendFile(path.join(__dirname, '../public/project/index.html'));
});

/**
 * Get all project of a specific user
 */
projectRouter.post('/all', function (request: any, respond: any) {
    cli.database.getProjectsOfUser(request.body.uid).then((value: any) => {
        respond.json(value);
    }).catch((reason: any) => {
        respond.status(400).json(reason);
    })
});

/**
 * create a new project
 */
projectRouter.post('/', function (request: any, respond: any) {
    const body = request.body;
    cli.projects.createProject(body).then((value: any) => {
        delete value.fileUrl;
        respond.json(value);
    }).catch((reason: any) => {
        respond.status(400).json(reason);
    });
});

module.exports = projectRouter;
