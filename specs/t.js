// const {bfast} = require('bfastnode');
//
// bfast.init({
//     functionsURL: `http://localhost:3000`,
//     databaseURL: `http://localhost:3000`
// });
//
// const e = bfast.functions().event(
//     '/logs/daas',
//     () => {
//         console.log('connected');
//         setInterval(args => {
//             e.emit({
//                 auth: {
//                     projectId: 'bfast'
//                 },
//                 body: {}
//             });
//         }, 3000);
//     },
//     () => {
//         console.log('disconnected');
//     }
// );
// e.listener(response => {
//     console.log(response);
// });
// console.log('done');
// // console.log(e);
