import {SecurityFactory} from "./SecurityFactory";
import {UserRoles} from "../model/user";
import {ProjectStoreAdapter, UsersStoreAdapter} from "../adapter/database";
import {Options} from "../config/Options";
import {UserStoreFactory} from "./UserStoreFactory";
import {ProjectStoreFactory} from "./ProjectStoreFactory";
import {SecurityAdapter} from "../adapter/security";
import {RouterGuardAdapter} from "../adapter/rest";

let userDatabase: UsersStoreAdapter;
let projectDatabase: ProjectStoreAdapter;
let security: SecurityAdapter;

// need to be modified
export class RouterGuardFactory implements RouterGuardAdapter {

    constructor(private readonly options: Options) {
        userDatabase = this.options.userStoreAdapter ?
            this.options.userStoreAdapter : new UserStoreFactory(this.options);
        projectDatabase = this.options.projectStoreAdapter ?
            this.options.projectStoreAdapter : new ProjectStoreFactory(this.options);
        security = this.options.securityAdapter ?
            this.options.securityAdapter : new SecurityFactory(this.options);
    }

    checkIsAdmin(request: any, response: any, next: any) {
        if (request.uid) {
            userDatabase.getRole(request.uid).then(role => {
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
            projectDatabase.getOwnerProject(request.uid, request.params.projectId).then(_ => {
                next();
            }).catch(reason => {
                response.status(403).json(reason);
            })
        } else {
            response.status(403).json({message: 'Fails to identify you and your project'});
        }
    }

    checkToken(request: any, response: any, next: any) {
        const header = request.headers['authorization'];
        if (header) {
            const bearer = header.split(' ');
            const token = bearer[1];
            security.verifyToken(token)
                .then(value => {
                    request.uid = value.uid ? value.uid : null;
                    next();
                }).catch(reason => {
                // console.log(reason);
                response.status(401).json(reason)
            });
        } else {
            //If header is undefined return Forbidden (403)
            response.status(401).json({message: 'Identify yourself'})
        }
    }

}
