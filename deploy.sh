#!/bin/sh
name=bfastapp
docker-compose -p ${name} build
docker-compose -p ${name} up -d
