const {exec} = require('child_process');

exec('bfast fs serve -p 5005', {
    // env: {
    //     // RSA_KEY: "",
    //     // RSA_KEY_PUBLIC: ""
    // },
    // cwd: process.cwd()
}, (error, stdout, stderr) => {
    console.log(stdout.toString());
    // if (error) {
    //     console.log(stderr.toString());
    // } else {
    //     console.log(stdout.toString());
    // }
});
