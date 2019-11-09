import {BFastCli} from "../cli";

let deployRouter = require('express').Router();

/* deploy functions. */
deployRouter.get('/functions/:projectId', function (req: any, res: any) {
    BFastCli.deploy.deployFunctions(req.params.projectId, req.query.force).then((value: any) => {
        res.status(200).json({message: 'functions deployed', stdout: value.toString()});
    }).catch((reason: any) => {
        res.status(503).json({message: 'fails to deploy', stderr: reason.toString()});
    })
});

module.exports = deployRouter;
