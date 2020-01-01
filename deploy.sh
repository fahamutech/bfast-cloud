#!/bin/sh
name=bfast
docker swarm init || echo 'pass initialize swarm mode'
docker network create -d overlay --attachable bfastnet || echo 'pass network creation...'
# docker-compose -p ${name} build
docker stack deploy -c ./docker-compose.yml --with-registry-auth ${name}
