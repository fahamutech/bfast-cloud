let UserController = require('./controller/userController').UserController;
let ProjectController = require('./controller/projectController').ProjectController;
let DatabaseController = require('./controller/databaseController').DatabaseController;

module.exports.Cli = {
    user: new UserController(),
    projects: new ProjectController(),
    database: new DatabaseController(),
};
