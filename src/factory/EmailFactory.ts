import {EmailAdapter} from "../adapters/email";

export class EmailFactory implements EmailAdapter {
    sendEmail(to: string, from: string, message: string): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve('email will be sent soon...');
        });
    }

}
