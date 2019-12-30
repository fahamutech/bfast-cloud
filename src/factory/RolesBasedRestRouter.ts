import {SecureRestRouter} from "./SecureRestRouter";
import {UserRoles} from "../model/user";
import {ProjectDatabaseAdapter, UsersDatabaseAdapter} from "../adapters/database";
import {Options} from "../config/Options";


export abstract class RolesBasedRestRouter extends SecureRestRouter {

    constructor(options: Options,
                private readonly userDatabase: UsersDatabaseAdapter,
                private readonly projectDatabase: ProjectDatabaseAdapter) {
        super(options);
    }

    checkIsAdmin(request: any, response: any, next: any) {
        if (request.uid) {
            this.userDatabase.getRole(request.uid).then(role => {
                if (role === UserRoles.ADMIN_ROLE) {
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

    checkIsProjectOwner(request: any, response: any, next: any) {
        if (request.uid && request.params.projectId) {
            this.projectDatabase.getOwnerProject(request.uid, request.params.projectId).then(_ => {
                next();
            }).catch(reason => {
                response.status(403).json(reason);
            })
        } else {
            response.status(403).json({message: 'Fails to identify you and your project'});
        }
    }
}
