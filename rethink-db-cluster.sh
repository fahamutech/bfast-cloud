docker network create -d overlay --attachable bfastweb || echo 'pass network creation...'
docker network create -d overlay --attachable rethinkdb || echo 'pass network creation...'
docker volume create --driver rexray/s3fs rethinkdb || echo "volume already created"
docker volume create --driver rexray/s3fs rethinkdbsecondary1 || echo "volume already created"
docker volume create --driver rexray/s3fs rethinkdbsecondary2 || echo "volume already created"

#remove previous services
docker service rm rdb-primary || echo "no rdb primary"
docker service rm rdb-secondary-1 || echo "no rdb secondary 1"
docker service rm rdb-secondary-2 || echo "no rdb secondary 2"
docker service rm rdb-proxy || echo "no rdb-proxy"

# create and start rethinkdb primary
docker service create --mount type=volume,src=rethinkdb,dst=/data,volume-driver=rexray/s3fs --name rdb-primary --network rethinkdb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --initial-password auto

sleep 1

# create and start rethinkdb secondary
docker service create --mount type=volume,src=rethinkdbsecondary1,dst=/data,volume-driver=rexray/s3fs --name rdb-secondary-1 --network rethinkdb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --join rdb-primary --initial-password auto

sleep 1

# up 3 nodes (primary + 2 secondary) to enable automatic failover
#docker service scale rdb-secondary=2

# create and start rethinkdb secondary
docker service create --mount type=volume,src=rethinkdbsecondary2,dst=/data,volume-driver=rexray/s3fs --name rdb-secondary-2 --network rethinkdb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --join rdb-primary --initial-password auto

sleep 1


# remove primary
docker service rm rdb-primary

# recreate primary with --join flag
docker service create --mount type=volume,src=rethinkdb,dst=/data,volume-driver=rexray/s3fs --name rdb-primary --network rethinkdb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --join rdb-secondary-1 --initial-password auto

sleep 1

# start 2 rdb-primary instances
#docker service scale rdb-primary=2
#
#sleep 1

# create and start rethinkdb proxy
docker service create --name rdb-proxy --network bfastweb --network rethinkdb --publish 81:8080 --publish 28015:28015 rethinkdb:2.4.0 rethinkdb proxy --bind all --join rdb-primary --initial-password "@bfast&rethinkdb"
