#!/usr/bin/env node

import {Bfast} from "./bfast";

new Bfast({port: process.env.PORT || '3000'});
