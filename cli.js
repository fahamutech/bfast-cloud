var UserController = require('./controller/userController').UserController
var ProjectController = require('./controller/projectController').ProjectController
var DatabaseController = require('./controller/databaseController').DatabaseController

module.exports.Cli = {
    user: new UserController(),
    projects: new ProjectController(),
    database: new DatabaseController(),
}
