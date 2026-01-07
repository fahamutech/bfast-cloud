#!/bin/bash

# Check if the required arguments are provided
if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <projectId> <cluster> <hostDomain> [envs...]"
    exit 1
fi

# Assign input arguments to variables
projectId=$1
cluster=$2
hostDomain=$3
shift 3
envs=("$@")

# Construct the Docker service create command as a single string
docker_command="/usr/local/bin/docker service create \
    --name ${projectId}_faas \
    --hostname ${projectId}_faas \
    --network bfastweb \
    --mode replicated \
    --replicas 0 \
    --restart-condition any \
    --restart-delay 5s \
    --label traefik.docker.network=bfastweb \
    --label traefik.enable=true \
    --label traefik.http.services.${projectId}-faas.loadbalancer.server.port=3000 \
    --label traefik.http.routers.${projectId}-faas.rule=Host\(\\\`${projectId}-faas.${cluster}.${hostDomain}\\\`,\\\`${projectId}.api.${hostDomain}\\\`\) \
    --label traefik.http.routers.${projectId}-faas.tls=true \
    --label traefik.http.routers.${projectId}-faas.tls.certresolver=le \
    --label traefik.http.services.${projectId}-faas.loadbalancer.sticky.cookie=true \
    --env PROJECT_ID=${projectId} \
    --env PORT=3000 \
    --env PRODUCTION=1"

# Add additional environment variables if provided
for env in "${envs[@]}"; do
    docker_command+=" --env $env"
done

# Add the image name
docker_command+=" joshuamshana/bfastfunction:latest"

# Print the constructed command
echo "Constructed command:"
echo "$docker_command"

# Execute the command
eval "$docker_command"