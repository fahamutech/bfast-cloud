var express = require('express');
var router = express.Router();
var cli = require('../cli').Cli;
let path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../public/project/index.html'));
});

router.post('/all', function(request, respond){
    cli.database.getProjectsOfUser(request.body.uid).then(value=>{
        respond.json(value);
    }).catch(reason=>{
        respond.status(400).json(reason);
    })
});

router.post('/', function(request, respond){
    const body = request.body;
    // console.log(body);
    cli.projects.createProject(body).then(value=>{
        delete value.fileUrl;
        respond.json(value);
    }).catch(reason=>{
        respond.status(400).json(reason);
    });
});

module.exports = router;
