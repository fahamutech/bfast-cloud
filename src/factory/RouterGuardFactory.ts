import {SecurityFactory} from "./SecurityFactory";
import {UserRoles} from "../model/user";
import {ProjectStoreAdapter, UsersStoreAdapter} from "../adapters/database";
import {Options} from "../config/Options";
import {UserStoreFactory} from "./UserStoreFactory";
import {ProjectStoreFactory} from "./ProjectStoreFactory";
import {SecurityAdapter} from "../adapters/security";
import {RouterGuardAdapter} from "../adapters/rest";

// need to be modified
export class RouterGuardFactory implements RouterGuardAdapter {

    private readonly userDatabase: UsersStoreAdapter;
    private readonly projectDatabase: ProjectStoreAdapter;
    private readonly security: SecurityAdapter;

    constructor(private readonly options: Options) {
        this.userDatabase = this.options.userStoreAdapter ?
            this.options.userStoreAdapter : new UserStoreFactory(this.options);
        this.projectDatabase = this.options.projectStoreAdapter ?
            this.options.projectStoreAdapter : new ProjectStoreFactory(this.options);
        this.security = this.options.securityAdapter ?
            this.options.securityAdapter : new SecurityFactory(this.options);
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

    checkToken(request: any, response: any, next: any) {
        const header = request.headers['authorization'];
        if (header) {
            const bearer = header.split(' ');
            const token = bearer[1];
            this.security.verifyToken(token)
                .then(value => {
                    request.uid = value.uid ? value.uid : null;
                    next();
                }).catch(reason => {
                console.log(reason);
                response.status(401).json({message: 'Unauthorized request', reason: reason.toString()})
            });
        } else {
            //If header is undefined return Forbidden (403)
            response.status(401).json({message: 'Identify yourself'})
        }
    }

}
