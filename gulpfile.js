const gulp = require('gulp');
const process = require('child_process');
const pkg = require('./package');
const MongoMemoryServer = require('mongodb-memory-server-core').MongoMemoryServer;

// const redisMock = require('redis-mock');

function build() {
    return new Promise((resolve, reject) => {
        console.log('start compile typescript');
        const childProcess = process.exec('tsc');
        handleProcessEvents(childProcess, resolve, reject);
    })
}

function copyStaticFiles() {
    console.log('start copy static files');
    return gulp.src('./src/public/**/*')
        .pipe(gulp.dest('./lib/public/'));
}

function copyComposeFiles() {
    console.log('start copying compose file');
    return gulp.src('./src/factory/compose-files/**/*')
        .pipe(gulp.dest('./lib/factory/compose-files/'));
}

function handleProcessEvents(childProcess, resolve, reject) {
    childProcess.on("error", err => {
        console.log(err);
        reject(err);
    });
    childProcess.on("exit", (code, signal) => {
        console.log(`build done with code: ${code} and signal: ${signal}`);
        resolve();
    });
    childProcess.stdout.on('data', (data) => {
        console.log(data);
    });
    childProcess.stderr.on('data', (data) => {
        console.log(data);
        reject(data);
    });
    resolve();
}

function buildDocker() {
    return new Promise(async (resolve, reject) => {
        console.log('start build docker image');
        const childProcess = process.exec(`sudo docker build -t joshuamshana/bfast-ee:v${pkg.version} .`);
        await handleProcessEvents(childProcess, resolve, reject);
    });
}

function publishDockerImage() {
    return new Promise(async (resolve, reject) => {
        console.log('start publish docker image');
        const publishDockerImageProcess = process.exec(`sudo docker push joshuamshana/bfast-ee:v${pkg.version}`);
        await handleProcessEvents(publishDockerImageProcess, resolve, reject);
    });
}

function publishDockerImageLatest() {
    return new Promise(async (resolve, reject) => {
        console.log('start publish docker image');
        const publishDockerImageProcess = process.exec(`sudo docker push joshuamshana/bfast-ee:latest`);
        await handleProcessEvents(publishDockerImageProcess, resolve, reject);
    });
}

function startDevServer() {
    return new Promise(async (resolve, reject) => {
        const dockerPath = process.execSync('which docker');
        const mongoServer = new MongoMemoryServer({
            autoStart: true,
        });
        const mongoUrl = await mongoServer.getConnectionString();
        const childProcess = process.exec(`npm run poststart:dev`, {
            env: {
                DEBUG: "true",
                MONGO_URL: mongoUrl, // "mongodb://localhost:27017/_BFAST_ADMIN",
                // REDIS_HOST: '',
                DOCKER_SOCKET: dockerPath.toString()
            }
        });
        await handleProcessEvents(childProcess, resolve, reject);
    });
}

exports.devStart = gulp.series(startDevServer);
exports.copyResiurceFolders = gulp.series(copyComposeFiles);
exports.buildDocker = gulp.series(build, copyComposeFiles, buildDocker)
exports.pubishDockerImage = gulp.series(build, copyComposeFiles,
    buildDocker, publishDockerImage, publishDockerImageLatest);
exports.default = gulp.series(build, copyComposeFiles);
