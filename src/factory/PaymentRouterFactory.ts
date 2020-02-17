import {PaymentRouterAdapter} from "../adapter/rest";
import {NextFunction, Request, Response} from "express";
import {Options} from "../config/Options";

let _options;

// Todo: Implement This class
export class PaymentRouterFactory implements PaymentRouterAdapter {

    constructor(private readonly options: Options) {
        _options = this.options;

    }

    checkIsBalanceEnough(request: Request, response: Response, next: NextFunction): void {
    }

    checkIsPaid(request: Request, response: Response, next: NextFunction): void {

    }

}
