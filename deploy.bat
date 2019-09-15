@echo off

set name= bfastapp
docker swarm init || echo 'pass initialize swarm mode'
docker network create -d overlay bfastweb || echo 'pass network creation...'
docker-compose -p %name% build
docker stack deploy %name% 
