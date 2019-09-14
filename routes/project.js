var express = require('express');
var router = express.Router();
var cli = require('../cli').Cli

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.redirect('/project.html');
});

router.get('/all', function(request, respond){
    cli.database.
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
