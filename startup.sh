#!/bin/bash

export JAVA_OPTS_APPEND="-XX:UseSVE=0"
cp opentdf-dev.yaml opentdf.yaml

./.github/scripts/init-temp-keys.sh
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ./keys/localhost.crt

# Kill existing containers and start fresh
docker ps -aq | xargs -r docker rm -f
docker compose up -d

# Wait for docker containers to be ready
sleep 4

go run ./service provision keycloak
go run ./service provision fixtures
go run ./service start
