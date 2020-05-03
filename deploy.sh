#!/bin/bash
if [ -e "$1" ]; then
  configPath=$1
  # shellcheck disable=SC1090
  source "${configPath}"
  docker swarm init || echo 'pass initialize swarm mode'
  docker network create -d overlay --attachable bfastweb || echo 'pass network creation...'
  docker network create -d overlay --attachable rethinkdb-net || echo 'pass network creation...'
  # shellcheck disable=SC2154
  docker plugin install --grant-all-permissions rexray/s3fs "${key}" "${secret}" "${endpoint}" "${s3Options}"
  if [ -e "$2" ]; then
    echo "Start deploying rethinkdb cluster"
    bash "$2"
  fi
#docker stack deploy -c ./docker-compose.yml --with-registry-auth ${name}
else
  echo "please specify configPath as first argument"
fi
