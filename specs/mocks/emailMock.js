module.exports.EmailMock = class {
    sendEmail(to, from, subject, message) {
        return new Promise((resolve, reject) => {
            resolve(`Follow Instruction sent to email : ${to}`);
        });
    }
};
