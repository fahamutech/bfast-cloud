#!/bin/bash
if [ -e "$1" ]; then
  configPath=$1
  # shellcheck disable=SC1090
  source "${configPath}"
  docker swarm init || echo 'pass initialize swarm mode'
  docker secret rm s3secretKey || echo 's3secretKey removed'
  docker secret rm s3accessKey || echo 's3accessKey removed'
  docker secret rm s3endpoint || echo 's3endpoint removed'
  docker secret create s3endpoint ./secrets/s3endpoint.txt
  docker secret create s3accessKey ./secrets/s3accessKey.txt
  docker secret create s3secretKey ./secrets/s3secretKey.txt
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
