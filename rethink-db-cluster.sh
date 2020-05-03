docker network create -d overlay --attachable bfastweb || echo 'pass network creation...'
docker network create -d overlay --attachable rethinkdb || echo 'pass network creation...'
docker volume create --driver rexray/s3fs rethinkdb || echo "volume already created"
docker volume create --driver rexray/s3fs rethinkdbsecondary || echo "volume already created"

# create and start rethinkdb primary
docker service create -v rethinkdb:/data --restart always --name rdb-primary --network rethinkdb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --initial-password auto

sleep 5

# create and start rethinkdb secondary
docker service create -v rethinkdbsecondary:/data --restart always --name rdb-secondary --network rethinkdb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --join rdb-primary --initial-password auto

sleep 5

# up 3 nodes (primary + 2 secondary) to enable automatic failover
docker service scale rdb-secondary=2

sleep 5

# remove primary
docker service rm rdb-primary

# recreate primary with --join flag
docker service create -v rethinkdb:/data --restart always --name rdb-primary --network rethinkdb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --join rdb-secondary --initial-password auto

sleep 5

# start 2 rdb-primary instances
docker service scale rdb-primary=2

sleep 5

# create and start rethinkdb proxy
docker service create --name rdb-proxy --network bfastweb rethinkdb --publish 81:8080 --publish 28015:28015 rethinkdb:2.4.0 rethinkdb proxy --bind all --join rdb-primary --initial-password "@bfast&rethinkdb"