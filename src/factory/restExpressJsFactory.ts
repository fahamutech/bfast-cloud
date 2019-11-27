import {RestAdapter, RestRouteMethod} from "../adapters/rest";
import {Express, NextFunction, Request, Response} from "express";

export class RestExpressJsFactory implements RestAdapter {
    expressApp: Express;

    constructor() {
        let express = require('express');
        this.expressApp = new express();
        this.initiateExpressApp();
    }

    private initiateExpressApp() {
        this.expressApp = require('express');
        // let logger = require('morgan');

        // let index = require('./router');
        // let users = require('./router/users');
        // let functionsRouter = require('./router/functions');
        // let deployRouter = require('./router/deploy');
        // let project = require('./router/project');

        this.expressApp.use(require('morgan')('dev'));
        // @ts-ignore
        this.expressApp.use(this.expressApp.json());
        // @ts-ignore
        this.expressApp.use(this.expressApp.urlencoded({extended: false}));
        this.expressApp.use(require('cookie-parser'));
        // @ts-ignore
        this.expressApp.use(this.expressApp.static(`${__dirname}/../public`));

        // this.expressApp.use('/', index);
        // this.expressApp.use('/functions', functionsRouter);
        // this.expressApp.use('/deploy', deployRouter);
        // this.expressApp.use('/project', project);

        // BFastControllers.database;

    }

    mount(routerPrefix: string, route: {
              method: string;
              path: string;
              onRequest: { (request: Request, response: Response, next: NextFunction): void }[]
          }
    ): any {
        switch (route.method) {
            case RestRouteMethod.GET:
                this.expressApp.get(`${routerPrefix}${route.path}`, route.onRequest);
                break;
            case RestRouteMethod.POST:
                this.expressApp.post(`${routerPrefix}${route.path}`, route.onRequest);
                break;
            case RestRouteMethod.DELETE:
                this.expressApp.delete(`${routerPrefix}${route.path}`, route.onRequest);
                break;
        }
    }

}
