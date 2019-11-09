const gulp = require('gulp');
const process = require('child_process');
const pkg = require('./package');

function build() {
    return new Promise((resolve, reject) => {
        console.log('start compile typescript');
        const npmBuildProcess = process.exec('tsc');
        npmBuildProcess.on("error", err => {
            console.log(err);
            reject(err);
        });
        npmBuildProcess.on("exit", (code, signal) => {
            console.log(`build done with code: ${code} and signal: ${signal}`);
            resolve();
        });
        npmBuildProcess.stdout.on('data', (data) => {
            console.log(data);
        });
        npmBuildProcess.stderr.on('data', (data) => {
            console.log(data);
            reject(data);
        });
    })
}

function copyStaticFiles() {
    console.log('start copy static files');
    return gulp.src('./src/public/**/*')
        .pipe(gulp.dest('./lib/public/'));
}

function copyComposeFiles() {
    console.log('start copying compose file');
    return gulp.src('./src/compose/**/*')
        .pipe(gulp.dest('./lib/compose/'));
}

function buildDocker() {
    return new Promise((resolve, reject) => {
        console.log('start build docker image');
        const buildDockerProcess = process.exec(`sudo docker build -t joshuamshana/bfast-ee:v${pkg.version} .`);
        buildDockerProcess.on("error", err => {
            console.log(err);
            reject(err);
        });
        buildDockerProcess.on("exit", (code, signal) => {
            console.log(`build done with code: ${code} and signal: ${signal}`);
            resolve();
        });
        buildDockerProcess.stdout.on('data', (data) => {
            console.log(data);
        });
        buildDockerProcess.stderr.on('data', (data) => {
            console.log(data);
            reject(data);
        });
        console.log('build docker image succeed');
    })
}

function publishDockerImage() {
    return new Promise((resolve, reject) => {
        console.log('start publish docker image');
        const publishDockerImageProcess = process.exec(`sudo docker push joshuamshana/bfast-ee:v${pkg.version}`);
        publishDockerImageProcess.on("error", err => {
            console.log(err);
            reject(err);
        });
        publishDockerImageProcess.on("exit", (code, signal) => {
            console.log(`build done with code: ${code} and signal: ${signal}`);
            resolve();
        });
        publishDockerImageProcess.stdout.on('data', (data) => {
            console.log(data);
        });
        publishDockerImageProcess.stderr.on('data', (data) => {
            console.log(data);
        });
        console.log('publish docker image succeed');
    })
}

function publishDockerImageLatest() {
    return new Promise((resolve, reject) => {
        console.log('start publish docker image');
        const publishDockerImageProcess = process.exec(`sudo docker push joshuamshana/bfast-ee:latest`);
        publishDockerImageProcess.on("error", err => {
            console.log(err);
            reject(err);
        });
        publishDockerImageProcess.on("exit", (code, signal) => {
            console.log(`build done with code: ${code} and signal: ${signal}`);
            resolve();
        });
        publishDockerImageProcess.stdout.on('data', (data) => {
            console.log(data);
        });
        publishDockerImageProcess.stderr.on('data', (data) => {
            console.log(data);
        });
        console.log('publish docker image succeed');
    })
}

function startDevServer() {
    return new Promise((resolve, reject) => {
        const d = process.execSync('which docker');
        console.log(d.toString());
        const devStartProcess = process.exec(`npm run devInit`, {
            env: {
                debug: true,
                mdbhost: "mongodb://localhost:27017/_BFAST_ADMIN",
                dSocket: d.toString()
            }
        });
        devStartProcess.on('exit', (code, signal) => {
            console.log(`dev server stop with code: ${code} and signal: ${signal}`);
            resolve();
        });
        devStartProcess.on('error', err => {
            reject(err);
        });

        devStartProcess.stdout.on('data', (data) => {
            console.log(data);
        });

        devStartProcess.stderr.on('data', (data) => {
            console.log(data);
        });
    });
}

exports.devStart = gulp.series(startDevServer);
exports.copyResiurceFolders = gulp.series(copyStaticFiles, copyComposeFiles);
exports.pubishDockerImage = gulp.series(build, copyStaticFiles, copyComposeFiles,
    buildDocker, publishDockerImage, publishDockerImageLatest);
exports.default = gulp.series(build, copyStaticFiles, copyComposeFiles, buildDocker);
