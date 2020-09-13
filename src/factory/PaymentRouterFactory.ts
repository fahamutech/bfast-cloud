import {BfastConfig} from "../configs/bfast.config";
import {PaymentRouterAdapter} from "../adapters/rest.adapter";
import {NextFunction, Request, Response} from "express";

let _options;

// Todo: Implement This class
export class PaymentRouterFactory implements PaymentRouterAdapter {

    constructor(private readonly options: BfastConfig) {
        _options = this.options;

    }

    checkIsBalanceEnough(request: Request, response: Response, next: NextFunction): void {
    }

    checkIsPaid(request: Request, response: Response, next: NextFunction): void {

    }

}
