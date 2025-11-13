#!/bin/bash

# Set the remote Docker host
export DOCKER_HOST=tcp://10.211.55.2:2375

# Run docker-compose with all passed arguments
docker-compose "$@"

