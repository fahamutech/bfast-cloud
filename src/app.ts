import {BFastCli} from "./cli";

let express = require('express');
let path1 = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let index = require('./routes');
let users = require('./routes/users');
let functionsRouter = require('./routes/functions');
let deployRouter = require('./routes/deploy');
let project = require('./routes/project');

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

BFastCli.database;
