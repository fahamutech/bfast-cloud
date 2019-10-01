import {Request, Response} from "express";
import * as path from 'path'

let router = require('express').Router();
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
router.get('/', function (req: Request, res: Response) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
