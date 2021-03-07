const {bfast} = require('bfastnode');

bfast.init({
    functionsURL: 'http://localhost:3000',// `https://api.bfast.fahamutech.com`,
    databaseURL: 'http://localhost:3000'//`https://api.bfast.fahamutech.com/v2`
});

const e = bfast.functions().event(
    '/logs',
    () => {
        console.log('connected');
        setInterval(args => {
            e.emit({
                auth: {
                    projectId: 'smartstock',
                    type: 'daas'
                },
                body: {
                    time: '0'
                }
            });
        }, 3000);
    },
    () => {
        console.log('disconnected');
    }
);
e.listener(response => {
    console.log(response);
});
console.log('done');
// console.log(e);
