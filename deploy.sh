#!/bin/bash
if [ -e "$1" ]; then
  configPath=$1
  # shellcheck disable=SC1090
  source "${configPath}"
  docker swarm init || echo 'pass initialize swarm mode'
  docker secret rm s3secretKey
  docker secret rm s3accessKey
  docker secret rm s3endpoint
  docker secret rm s3endpointUsEast1
  docker secret rm privkey
  docker secret rm cert
  docker secret create privkey "${privkey}"
  docker secret create cert "${cert}"
  docker secret create s3endpoint "${s3endpoint}"
  docker secret create s3endpointUsEast1 "${s3endpointUsEast1}"
  docker secret create "${s3accessKey}"
  docker secret create s3secretKey "${s3secretKey}"
  docker network create -d overlay --attachable bfastweb || echo 'pass network creation...'
  if [ -e "$2" ]; then
    echo "Start deploying mongo cluster"
    bash "$2"
  else
    echo "mongo cluster not specified"
  fi
  docker stack deploy -c ./docker-compose.yml --with-registry-auth "${cluster}"
else
  echo "please specify configPath as first argument"
fi
