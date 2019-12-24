# Real time chat w/ Firebase Auth

## Getting started

### Replace env variables
1. `cp docker/docker-compose-copy.yaml docker/docker-compose.yaml`
1. `cp src/config-copy.js src/config1.js `

### Run containers
1. Start postgres and hasura in `./docker/` with `docker-compose up -d`

### Follow tutorial
1. Create firebase auth and realtime database rules as in original tutorial
    1. https://blog.hasura.io/authentication-and-authorization-using-hasura-and-firebase/
    1. When creating the permissions in the hasura admin UI, remember to `enable aggregate` permissions for `user`
    1. or import the metadata.json from the UI
