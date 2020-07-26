docker service update --force --image joshuamshana/bfast-ce-daas:latest "$1"_daas

#--env-add  S3_BUCKET=bfast-$1 \
#--env-add 'S3_ACCESS_KEY=5IGXSX5CU52C2RFZFALG' \
#--env-add 'S3_SECRET_KEY=2q2vteO9lQp6LaxT3lGMLdkUF5THdxZWmyWmb1y9' \
#--env-add 'S3_ENDPOINT=https://eu-central-1.linodeobjects.com/' \
