#!/usr/bin/env node

import {BfastCloud} from "./bfast::cloud";

new BfastCloud({port: process.env.PORT || '3000'});
