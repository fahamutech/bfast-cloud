docker build --tag build-cloud .
rm -r node_modules
docker run --rm -v "${PWD}":/bfast build-cloud npm install --production
npm config set //registry.npmjs.org/:_authToken="${NPM_TOKEN}"
