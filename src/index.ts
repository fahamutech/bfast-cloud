#!/usr/bin/env node

import {BFastCloud} from "./app";
import {BFastRouters} from "./router";

new BFastCloud({routers: BFastRouters, port: process.env.PORT || '3000'});
