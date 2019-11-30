import {SecureRestRouter} from "./SecureRestRouter";
import {UserRoles} from "../model/user";
import {UsersDatabaseFactory} from "./UsersDatabaseFactory";
import {BFastSecurity} from "./SecurityFactory";
import {EmailFactory} from "./EmailFactory";
import {ProjectDatabaseFactory} from "./projectDatabaseFactory";

const bFastSecurity = new BFastSecurity();
const userDatabase = new UsersDatabaseFactory(bFastSecurity, new EmailFactory());
const projectDatabase = new ProjectDatabaseFactory();

export abstract class RolesBasedRestRouter extends SecureRestRouter {

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
            projectDatabase.getProjectByOwner(request.uid, request.params.projectId).then(_ => {
                next();
            }).catch(reason => {
                response.status(403).json(reason);
            })
        } else {
            response.status(403).json({message: 'Fails to identify you and your project'});
        }
    }
}
