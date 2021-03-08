const {bfast} = require('bfastnode');

const localTestURL = 'http://localhost:3000';
const remoteTestURL = `https://api.bfast.fahamutech.com`;

bfast.init({
    functionsURL: remoteTestURL,
    databaseURL: remoteTestURL
});

const e = bfast.functions().event(
    '/logs',
    () => {
        console.log('connected');
        setInterval(_ => {
            e.emit({
                auth: {
                    projectId: 'smartstock',
                    type: 'daas'
                },
                body: {
                    time: '0'
                }
            });
        }, 5000);
    },
    () => {
        console.log('disconnected');
    }
);
e.listener(response => {
    console.log(response.body.replace('\n', ''));
});
console.log('done');
// console.log(e);
