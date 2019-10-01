let usersRouter = require('express').Router();

/* GET users listing. */
usersRouter.get('/', function (req: any, res: any, next: any) {
    res.send('respond with a resource');
});

module.exports = usersRouter;
