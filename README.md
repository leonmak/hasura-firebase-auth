# Real time chat w/ Firebase Auth

## Getting started
1. Start postgres and hasura in `./docker/` with `docker-compose up -d`
1. Create firebase auth and realtime database rules as in original tutorial
    1. When creating the permissions in the hasura admin UI, remember to `enable aggregate` permissions for `user`
