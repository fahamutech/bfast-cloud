#!/usr/bin/env node

import {BFastCloud} from "./bfast-cloud";

new BFastCloud({port: process.env.PORT || '3000'});
