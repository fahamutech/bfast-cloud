module.exports.NodeShell = class {
    exec(cmd, options) {
        return new Promise((resolve, reject) => {
            // console.log('shell::=>', cmd);
            // console.log('shell::=>', options);
            resolve({message: 'done execute mock command'});
        })
    }
};
