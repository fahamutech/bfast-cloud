import {SecureRestRouter} from "./SecureRestRouter";
import {UserRoles} from "../model/user";
import {UsersDatabaseFactory} from "./UsersDatabaseFactory";
import {BFastSecurity} from "./SecurityFactory";
import {EmailFactory} from "./EmailFactory";

const bFastSecurity = new BFastSecurity();
const database = new UsersDatabaseFactory(bFastSecurity, new EmailFactory());

export abstract class RolesBasedRestRouter extends SecureRestRouter {

    checkIsAdmin(request: any, response: any, next: any) {
        if (request.uid) {
            database.getRole(request.uid).then(role => {
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
}
