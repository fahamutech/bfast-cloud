import {BFastCli} from "../cli";

let functionsRouter = require('express').Router();

// in future must be replaced with web socket to return each step when deploy a functions or update env


functionsRouter.get('/:projectId/deploy', (request: any, response: any) => {
    BFastCli.functions.deploy(request.params.projectId, request.query.force).then(value => {
        response.status(200).json({message: 'functions deployed'});
    }).catch(reason => {
        response.status(503).json({message: 'fails to deploy', reason: reason.toString()});
    });
});

functionsRouter.post('/:projectId/env', (request: any, response: any) => {
    BFastCli.functions.envAdd(request.params.projectId, request.body.envs, request.query.force).then(value => {
        response.status(200).json({message: 'envs updated'});
    }).catch(reason => {
        response.status(503).json({message: 'fails to add envs', reason: reason.toString()});
    });
});

functionsRouter.delete('/:projectId/env', (request: any, response: any) => {
    BFastCli.functions.envRemove(request.params.projectId, request.body.envs, request.query.force).then(value => {
        response.status(200).json({message: 'envs updated'});
    }).catch(reason => {
        response.status(503).json({message: 'fails to remove envs', reason: reason.toString()});
    });
});

module.exports = functionsRouter;
