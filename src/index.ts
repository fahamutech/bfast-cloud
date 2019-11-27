#!/usr/bin/env node

import {BFastCloud} from "./app";
import {RestApiExpressJsFactory} from "./factory/restApiExpressJsFactory";

const express = require('express');
const app = express();

new BFastCloud(new RestApiExpressJsFactory(app, express), {port: process.env.PORT || '3000'})
    .startServer(app, require('http'));
