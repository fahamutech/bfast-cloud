let express = require('express');
let router = express.Router();
// const Docker = require('dockerode');

// const platform = require('os').platform();
// console.log(platform);

// let docker;
// try {
//     docker = new Docker({
//         host: 'localhost',
//         port: process.env.DOCKER_PORT || 2375,
//         socketPath: '/var/run/docker.sock'
//     });
// }catch (e) {
//     docker = new Docker({
//         host: 'localhost',
//         port: process.env.DOCKER_PORT || 2375,
//     });
// }

// // console.log(docker);
// docker.listContainers(null, function (err, data) {
//     if (err){
//         console.log(err)
//     } else {
//         console.log(data)
//     }
// });

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

module.exports = router;
