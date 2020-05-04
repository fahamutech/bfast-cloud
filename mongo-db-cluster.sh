docker network create -d overlay --attachable bfastweb || echo 'pass network creation...'
docker network create -d overlay --attachable mongo-net || echo 'pass mongo network creation...'

#remove previous services
docker service rm mdb || echo "no mongo primary"
docker service rm mdbrs1 || echo "no mongo secondary 1"
docker service rm mdbrs2 || echo "no mongo secondary 2"

# create and start mongo primary
# docker service create --constraint node.role==manager --mount type=volume,src=rethinkdblocal,dst=/data,volume-driver=local --name rdb-primary --publish 81:8080 --network bfastweb rethinkdb:2.4.0 rethinkdb --bind all --initial-password auto

#sleep 1
#
## create and start rethinkdb secondary
#docker service create --mount type=volume,src=rethinkdbsecondary1,dst=/data,volume-driver=rexray/s3fs --name rdb-secondary-1 --network bfastweb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --canonical-address rdb-primary --join rdb-primary --initial-password auto
#
#sleep 1
#
## up 3 nodes (primary + 2 secondary) to enable automatic failover
##docker service scale rdb-secondary=2
#
## create and start rethinkdb secondary
#docker service create --mount type=volume,src=rethinkdbsecondary2,dst=/data,volume-driver=rexray/s3fs --name rdb-secondary-2 --network bfastweb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --canonical-address rdb-primary --join rdb-primary --initial-password auto
#
#sleep 1
#
#
## remove primary
#docker service rm rdb-primary
#
## recreate primary with --join flag
#docker service create --mount type=volume,src=rethinkdb,dst=/data,volume-driver=rexray/s3fs --name rdb-primary --network bfastweb rethinkdb:2.4.0 rethinkdb --bind all --no-http-admin --canonical-address rdb-secondary-1 --join rdb-secondary-1 --initial-password auto
#
#sleep 1
#
## start 2 rdb-primary instances
##docker service scale rdb-primary=2
##
##sleep 1
#
## create and start rethinkdb proxy
#docker service create --name rdb-proxy --network bfastweb --publish 81:8080 --publish 28015:28015 rethinkdb:2.4.0 rethinkdb proxy --bind all --join rdb-primary --canonical-address rdb-primary --initial-password "@bfast&rethinkdb"