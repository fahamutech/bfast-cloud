import {EmailAdapter} from "../adapters/email";
import * as nodemailer from 'nodemailer';

export class EmailFactory implements EmailAdapter {
    async sendEmail(to: string, from: string, subject: string, message: string): Promise<any> {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: "jmshana@datavision.co.tz", // generated ethereal user
                    pass: "@Joshua&5715" // generated ethereal password
                }
            });
            const response = await transporter.sendMail({
                from: `"BFast::Cloud👻" <${from}>`, // sender address
                to: `${to}`, // list of receivers
                subject: subject, // Subject line
                // text: "Hello", // plain text body
                html: message // html body
            });
            return 'Email sent';
        } catch (e) {
            throw {message: "Fails to send email", reason: e.toString()};
        }
    }
}
