import bfast from "bfast";


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
                        'authorization': 'fzJogB87b8D3gTxU0u6utUx4CELiI24M7LSJMmfVZE7bjFmb2guNIcsiktQQPB8'
                    }
                }
            );
    }
}
