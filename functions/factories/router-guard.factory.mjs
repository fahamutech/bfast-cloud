import {SecurityFactory} from "./security.factory.mjs";
import {UserRoles} from "../models/user.model.mjs";
import {OptionsConfig} from "../configs/options.config.mjs";

export class RouterGuardFactory {

    options;

    /**
     *
     * @param userStoreFactory {UserStoreFactory}
     * @param projectStoreFactory {ProjectStoreFactory}
     * @param securityFactory {SecurityFactory}
     * @param options {OptionsConfig}
     */
    constructor(userStoreFactory, projectStoreFactory,
                securityFactory, options) {
        this.options = options;
        this._userDatabase = userStoreFactory;
        this._projectDatabase = projectStoreFactory;
        this._security = securityFactory;
    }

    checkIsAdmin(request, response, next) {
        if (request.uid) {
            this._userDatabase.getRole(request.uid).then(value => {
                if (value.role === UserRoles.ADMIN_ROLE) {
                    next();
                }
                // temporary allow smartstock to pass
                else if (value.email === 'smartstocktz@gmail.com') {
                    next();
                }
                else {
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
    checkIsProjectOwner(request, response, next) {
        // @ts-ignore
        if (request.uid && request.params.projectId) {
            if (!this.options.devMode) {
                // @ts-ignore
                this._projectDatabase.getOwnerProject(request.uid, request.params.projectId).then(_ => {
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

    checkToken(request, response, next) {
        let header = request.headers['authorization'];
        if (!header && request.query.token) {
            header = 'Bearer ' + request.query.token;
        }
        if (header) {
            let bearer = header.split(' ');
            let token = bearer[1];
            this._security.verifyToken(token)
                .then(value => {
                    request.uid = value.uid ? value.uid : null;
                    request.email = value.email ? value.email : null;
                    next();
                }).catch(reason => {
                console.log(reason);
                response.status(401).json(reason)
            });
        } else {
            response.status(401).json({message: 'Identify yourself'})
        }
    }

    checkMasterKey(request, response, next) {
        const masterKey = request.headers.authorization;
        if (masterKey && masterKey === this.options.masterKey) {
            next();
        } else {
            response.status(401).json({message: 'Unauthorized action'});
        }
    }

    // todo: implement this
    checkPayment(request, response, next) {
        next();
    }

}
