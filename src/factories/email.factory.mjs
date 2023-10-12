import bfast from "bfast";
import {getEnv} from "../env.mjs";


export class EmailFactory {

    /**
     *
     * @param data {
     * {
     *      from: string,
     *      to: Array<string>,
     *      subject: string,
     *      text: string,
     *      html: string,
     *      attachment
     * }
     * }
     * @param devMode
     * @return {Promise<*>}
     */
    async sendMail(data, devMode = false) {
        if (devMode === true){
            return 'ok in dev';
        }
        return bfast.functions('fahamutaarifa')
            .request('/mail')
            .post(data, {
                    headers: {
                        'authorization': getEnv('TAARIFA_TOKEN')
                    }
                }
            );
    }
}
