import {EmailAdapter} from "../adapters/email.adapter";

export class EmailFactory extends EmailAdapter {

    /**
     *
     * @param to {string}
     * @param from {string}
     * @param subject {string}
     * @param message {string}
     * @return {Promise<string>}
     */
    async sendEmail(to, from, subject, message) {
        try {
            // const transporter = nodemailer.createTransport({
            //     host: "smtp.gmail.com",
            //     port: 465,
            //     secure: true, // true for 465, false for other ports
            //     auth: {
            //         user: "fahamutechdevelopers@gmail.com", // generated ethereal user
            //         pass: "fahamutech::developers::email" // generated ethereal password
            //     }
            // });
            // await transporter.sendMail({
            //     from: `"BFast::Cloud👻" ☁️`, // sender address
            //     to: `${to}`, // list of receivers
            //     subject: subject, // Subject line
            //     // text: "Hello", // plain text body
            //     html: message // html body
            // });
            return 'Email sent';
        } catch (e) {
            throw e.toString();
        }
    }
}
