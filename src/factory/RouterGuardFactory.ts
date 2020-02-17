import {SecurityFactory} from "./SecurityFactory";
import {UserRoles} from "../model/user";
import {ProjectStoreAdapter, UsersStoreAdapter} from "../adapter/database";
import {Options} from "../config/Options";
import {UserStoreFactory} from "./UserStoreFactory";
import {ProjectStoreFactory} from "./ProjectStoreFactory";
import {RouterGuardAdapter} from "../adapter/rest";
import {NextFunction, Request, Response} from "express";
import {SecurityAdapter} from "../adapter/security";

let _userDatabase: UsersStoreAdapter;
let _projectDatabase: ProjectStoreAdapter;
let _security: SecurityAdapter;
let _options: Options;

// need to be modified
export class RouterGuardFactory implements RouterGuardAdapter {

    constructor(private readonly options: Options) {
        _options = this.options;
        _userDatabase = _options.userStoreAdapter ?
            _options.userStoreAdapter : new UserStoreFactory(_options);
        _projectDatabase = _options.projectStoreAdapter ?
            _options.projectStoreAdapter : new ProjectStoreFactory(_options);
        _security = _options.securityAdapter ?
            _options.securityAdapter : new SecurityFactory(_options);
    }

    checkIsAdmin(request: any, response: Response, next: NextFunction) {
        if (request.uid) {
            _userDatabase.getRole(request.uid).then(value => {
                if (value.role === UserRoles.ADMIN_ROLE) {
                    next();
                } else {
                    response.status(403).json({
                        message: 'Forbidden request',
                        reason: 'you don\'t have enough role'
                    });
                }
            }).catch(reason => {
                response.status(403).json(reason);
            })
        } else {
            response.status(401).json({message: 'Identify yourself'});
        }
    }

    // ToDo: Implement this method in dev mode
    checkIsProjectOwner(request: Request, response: Response, next: any) {
        // @ts-ignore
        if (request.uid && request.params.projectId) {
            if (!_options.devMode) {
                // @ts-ignore
                _projectDatabase.getOwnerProject(request.uid, request.params.projectId).then(_ => {
                    next();
                }).catch(reason => {
                    response.status(403).json(reason);
                })
            } else {
                next();
            }
        } else {
            response.status(403).json({message: 'Fails to identify you and your project'});
        }
    }

    checkToken(request: Request, response: Response, next: any) {
        let header = request.headers['authorization'];
        if (!header && request.query.token) {
            header = 'Bearer ' + request.query.token;
        }
        if (header) {
            let bearer = header.split(' ');
            let token = bearer[1];
            _security.verifyToken(token)
                .then(value => {
                    // @ts-ignore
                    request.uid = value.uid ? value.uid : null;
                    // @ts-ignore
                    request.email = value.email ? value.email : null;
                    next();
                }).catch(reason => {
                console.log(reason);
                response.status(401).json(reason)
            });
        } else {
            //If header is undefined return Forbidden (403)
            response.status(401).json({message: 'Identify yourself'})
        }
    }

    checkMasterKey(request: Request, response: any, next: any): void {
        const masterKey = request.headers.authorization;
        if (masterKey && masterKey === _options.masterKey) {
            next();
        } else {
            response.status(401).json({message: 'Unauthorized action'});
        }
    }

}
