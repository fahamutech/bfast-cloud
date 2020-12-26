import {BfastConfig} from "../configs/bfast.config.mjs";

let _options;

// Todo: Implement This class
export class PaymentRouterFactory {

    /**
     *
     * @param options {BfastConfig}
     */
    constructor(options) {
        _options = options;

    }

    /**
     *
     * @param request
     * @param response
     * @param next
     */
    checkIsBalanceEnough(request, response, next) {
    }

    /**
     *
     * @param request
     * @param response
     * @param next
     */
    checkIsPaid(request, response, next) {

    }

}
