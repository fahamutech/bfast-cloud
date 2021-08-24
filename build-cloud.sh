docker build --tag build-cloud .
docker run --rm -v "${PWD}":/bfast build-cloud npm install --only=production
npm config set //registry.npmjs.org/:_authToken="${NPM_TOKEN}"
npm run test
npm publish
