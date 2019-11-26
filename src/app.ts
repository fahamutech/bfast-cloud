import {BFastControllers} from "./controller";

let express = require('express');
let path1 = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let index = require('./router');
let users = require('./router/users');
let functionsRouter = require('./router/functions');
let deployRouter = require('./router/deploy');
let project = require('./router/project');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
// app.use(sassMiddleware({
//   src: path1.join(__dirname, 'public'),
//   dest: path1.join(__dirname, 'public'),
//   indentedSyntax: true, // true = .sass and false = .scss
//   sourceMap: true
// }));
app.use(express.static(path1.join(__dirname, 'public')));

app.use('/', index);
// app.use('/users', users);
app.use('/functions', functionsRouter);
app.use('/deploy', deployRouter);
app.use('/project', project);

module.exports = app;

BFastControllers.database;
