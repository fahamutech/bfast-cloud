#!/bin/bash
if [ -e "$1" ]; then
  configPath=$1
  # shellcheck disable=SC1090
  source "${configPath}"
  docker swarm init || echo 'pass initialize swarm mode'
  docker network create -d overlay --attachable bfastweb || echo 'pass network creation...'
  # shellcheck disable=SC2154
  if [ -e "$2" ]; then
    echo "Start deploying mongo cluster"
    bash "$2"
  else
    echo "mongo cluster not specified"
  fi
  # shellcheck disable=SC2154
  docker stack deploy -c ./docker-compose.yml --with-registry-auth "${name}"
else
  echo "please specify configPath as first argument"
fi
