const {bfast} = require('bfastnode');

bfast.init({
    functionsURL:  `https://api.bfast.fahamutech.com`,
    databaseURL: `https://api.bfast.fahamutech.com/v2`
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
                    time: '1'
                }
            });
        }, 3000);
    },
    () => {
        console.log('disconnected');
    }
);
e.listener(response => {
    console.log(response.body);
});
console.log('done');
// console.log(e);
