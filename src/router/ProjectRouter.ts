import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapter/rest";
import {Options} from "../config/Options";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {ProjectController} from "../controller/ProjectController";
import {UsersStoreAdapter} from "../adapter/database";
import {UserStoreFactory} from "../factory/UserStoreFactory";

let routerGuard: RouterGuardAdapter;
let projects: ProjectController;
let users: UsersStoreAdapter;

export class ProjectRouter implements RestRouterAdapter {
    prefix: string = '/projects';

    constructor(private  options: Options) {
        routerGuard = this.options.routerGuard ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
        users = this.options.userStoreAdapter ?
            this.options.userStoreAdapter : new UserStoreFactory(this.options);
        projects = new ProjectController(this.options);
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
                routerGuard.checkToken,
                (request, response, next) => {
                    // @ts-ignore
                    const valid = !!(request.uid && request.params.projectId);
                    if (valid) {
                        // @ts-ignore
                        projects.getUserProject(request.uid, request.params.projectId)
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
                routerGuard.checkToken,
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
                        && body.description);
                    if (valid) {
                        try {
                            // @ts-ignore
                            body.user = await users.getUser(request.uid);
                            const result = await projects.createBFastProject(body);
                            delete result.fileUrl;
                            response.status(200).json(result);
                        } catch (e) {
                            response.status(500).json(e);
                        }
                    } else {
                        response.status(400).json({message: 'Invalid project data'});
                    }
                }
            ]
        }
    }

    /**
     *  rest: /projects/ -X GET
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
                routerGuard.checkToken,
                (request, response, _) => {
                    // @ts-ignore
                    projects.getUserProjects(request.uid, 10000, 0).then((value: any) => {
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
                routerGuard.checkToken,
                (request, response, _) => {
                    const projectId = request.params.projectId;

                    // @ts-ignore
                    const valid = !!(projectId && request.uid);
                    if (valid) {
                        // @ts-ignore
                        projects.deleteUserProject(request.uid, projectId).then((value: any) => {
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
                routerGuard.checkToken,
                (request, response) => {
                    const body = request.body;
                    const projectId = request.params.projectId;
                    // @ts-ignore
                    const valid = !!(projectId && request.uid);
                    if (valid) {
                        projects
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
