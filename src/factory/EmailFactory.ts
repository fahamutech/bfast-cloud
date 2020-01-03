import {EmailAdapter} from "../adapter/email";
import * as nodemailer from 'nodemailer';

export class EmailFactory implements EmailAdapter {
    async sendEmail(to: string, from: string, subject: string, message: string): Promise<any> {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: "fahamutechdevelopers@gmail.com", // generated ethereal user
                    pass: "fahamutech::developers::password" // generated ethereal password
                }
            });
            await transporter.sendMail({
                from: `"BFast::Cloud👻" ☁️`, // sender address
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
