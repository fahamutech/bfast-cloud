import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapter/rest";
import {Options} from "../config/Options";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {ProjectController} from "../controller/ProjectController";
import {UsersStoreAdapter} from "../adapter/database";
import {UserStoreFactory} from "../factory/UserStoreFactory";

let _routerGuard: RouterGuardAdapter;
let _projects: ProjectController;
let _users: UsersStoreAdapter;

export class ProjectRouter implements RestRouterAdapter {
    prefix: string = '/projects';

    constructor(private  options: Options) {
        _routerGuard = this.options.routerGuard ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
        _users = this.options.userStoreAdapter ?
            this.options.userStoreAdapter : new UserStoreFactory(this.options);
        _projects = new ProjectController(this.options);
    }

    getRoutes(): RestRouterModel[] {
        return [
            this._getProject(),
            this._createNewProject(),
            this._getProjects(),
            this._deleteProject(),
            this._patchProject()
        ];
    }

    /**
     *  rest: /projects/:projectId -X GET
     *  input:  -H'Authorization': token,
     *  output: json
     * @private
     */
    private _getProject(): RestRouterModel {
        return {
            name: 'getProject',
            method: RestRouterMethod.GET,
            path: '/:projectId',
            onRequest: [
                _routerGuard.checkToken,
                (request, response, next) => {
                    // @ts-ignore
                    const valid = !!(request.uid && request.params.projectId);
                    if (valid) {
                        // @ts-ignore
                        _projects.getUserProject(request.uid, request.params.projectId)
                            .then((project: any) => {
                                response.status(200).json(project);
                            })
                            .catch((reason: any) => {
                                response.status(404).json(reason);
                            });
                    } else {
                        response.status(400).json({message: 'Invalid data'})
                    }
                }
            ]
        }
    }

    /**
     *  rest: /projects/:type -X POST
     *  type can be bfast || ssm
     *  input:  -H'Authorization': token, --data json
     *  output: json
     * @private
     */
    private _createNewProject(): RestRouterModel {
        return {
            name: 'createNewProject',
            method: RestRouterMethod.POST,
            path: '/:type',
            onRequest: [
                _routerGuard.checkToken,
                /*check for payments if there is enough fund to proceed*/
                async (request, response) => {
                    const body = request.body;
                    const valid = !!(
                        // @ts-ignore
                        request.uid
                        && request.params
                        && request.params.type
                        && body
                        && body.name
                        && body.projectId
                        && body.projectId !== 'cloud'
                        && body.projectId !== 'console'
                        && body.projectId !== 'api'
                        && body.projectId !== '_BFAST_ADMIN'
                        && body.projectId !== 'dashboard'
                        && body.parse
                        && body.parse.appId
                        && body.parse.masterKey
                        && body.description);
                    if (valid) {
                        try {
                            // @ts-ignore
                            body.user = await _users.getUser(request.uid);
                            body.type = request.params.type;
                            const result = await _projects.createBFastProject(body);
                            delete result.fileUrl;
                            delete result.parse.masterKey;
                            response.status(200).json(result);
                        } catch (reason) {
                            response.status(500).json(reason);
                        }
                    } else {
                        response.status(400).json({message: 'Invalid project data'});
                    }
                }
            ]
        }
    }

    /**
     *  rest: /projects/?skip=0&size=20 -X GET
     *  input:  -H'Authorization': token,
     *  output: json
     * @private
     */
    private _getProjects(): RestRouterModel {
        return {
            name: 'getProjects',
            method: RestRouterMethod.GET,
            path: '/',
            onRequest: [
                _routerGuard.checkToken,
                (request, response, _) => {
                    // @ts-ignore
                    _projects.getUserProjects(request.uid, 10000, 0).then((value: any) => {
                        response.json(value);
                    }).catch((reason: any) => {
                        response.status(404).json(reason);
                    });
                }
            ]
        };
    }

    /**
     *  rest: /projects/:projectId -X DELETE
     *  input:  -H'Authorization': token
     *  output: json
     * @private
     */
    private _deleteProject(): RestRouterModel {
        return {
            name: 'deleteProject',
            method: RestRouterMethod.DELETE,
            path: '/:projectId',
            onRequest: [
                _routerGuard.checkToken,
                (request, response, _) => {
                    const projectId = request.params.projectId;

                    // @ts-ignore
                    const valid = !!(projectId && request.uid);
                    if (valid) {
                        // @ts-ignore
                        _projects.deleteUserProject(request.uid, projectId).then((value: any) => {
                            response.status(200).json(value);
                        }).catch((reason: any) => {
                            response.status(500).json(reason);
                        });
                    } else {
                        response.status(400).json({message: 'Input not valid'});
                    }
                }
            ]
        };
    }

    /**
     *  rest: /projects/:projectId -X PATCH
     *  input:  -H'Authorization': token, --data json
     *  output: json
     * @private
     */
    private _patchProject(): RestRouterModel {
        return {
            name: 'patchProjectDetails',
            method: RestRouterMethod.PATCH,
            path: '/:projectId',
            onRequest: [
                _routerGuard.checkToken,
                (request, response) => {
                    const body = request.body;
                    const projectId = request.params.projectId;
                    // @ts-ignore
                    const valid = !!(projectId && request.uid);
                    if (valid) {
                        _projects
                            // @ts-ignore
                            .patchProjectDetails(request.uid, projectId, body).then((value: any) => {
                            response.status(200).json(value);
                        }).catch((reason: any) => {
                            response.status(500).json(reason);
                        });
                    } else {
                        response.status(400).json({message: 'Input not valid'});
                    }
                }
            ]
        }
    }
}
