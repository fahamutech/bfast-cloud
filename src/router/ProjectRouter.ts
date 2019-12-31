import {RestRouterAdapter, RestRouterMethod, RestRouterModel, RouterGuardAdapter} from "../adapters/rest";
import {Options} from "../config/Options";
import {RouterGuardFactory} from "../factory/RouterGuardFactory";
import {ProjectController} from "../controller/ProjectController";
import {UsersStoreAdapter} from "../adapters/database";
import {UserStoreFactory} from "../factory/UserStoreFactory";

export class ProjectRouter implements RestRouterAdapter {
    prefix: string = '/projects';

    private readonly routerGuard: RouterGuardAdapter;
    private readonly projects: ProjectController;
    private readonly users: UsersStoreAdapter;

    constructor(private readonly options: Options) {
        this.routerGuard = this.options.routerGuard ?
            this.options.routerGuard : new RouterGuardFactory(this.options);
        this.users = this.options.userStoreAdapter ?
            this.options.userStoreAdapter : new UserStoreFactory(this.options);
        this.projects = new ProjectController(this.options);
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

    private _getProject(): RestRouterModel {
        return {
            name: 'getProject',
            method: RestRouterMethod.GET,
            path: '/:projectId',
            onRequest: [
                this.routerGuard.checkToken,
                (request, response, next) => {
                    // @ts-ignore
                    const valid = !!(request.uid && request.params.projectId);
                    if (valid) {
                        // @ts-ignore
                        this.projects.getUserProject(request.uid, request.params.projectId)
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

    // private _validateProjectName(body: any): boolean{
    //
    // }
    private _createNewProject(): RestRouterModel {
        return {
            name: 'createNewProject',
            method: RestRouterMethod.POST,
            path: '/:type',
            onRequest: [
                this.routerGuard.checkToken,
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
                            body.user = await this.users.getUser(request.uid);
                            const project = await this.projects.createBFastProject(body);
                            delete project.fileUrl;
                            response.status(200).json(project);
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

    private _getProjects(): RestRouterModel {
        return {
            name: 'getProjects',
            method: RestRouterMethod.GET,
            path: '/',
            onRequest: [
                this.routerGuard.checkToken,
                (request, response, _) => {
                    // @ts-ignore
                    this.projects.getUserProjects(request.uid, 10000, 0).then((value: any) => {
                        response.json(value);
                    }).catch((reason: any) => {
                        response.status(404).json(reason);
                    });
                }
            ]
        };
    }

    private _deleteProject(): RestRouterModel {
        return {
            name: 'deleteProject',
            method: RestRouterMethod.DELETE,
            path: '/:projectId',
            onRequest: [
                this.routerGuard.checkToken,
                (request, response, _) => {
                    const projectId = request.params.projectId;

                    // @ts-ignore
                    const valid = !!(projectId && request.uid);
                    if (valid) {
                        // @ts-ignore
                        this.projects.deleteUserProject(request.uid, projectId).then((value: any) => {
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

    private _patchProject(): RestRouterModel {
        return {
            name: 'patchProjectDetails',
            method: RestRouterMethod.PATCH,
            path: '/:projectId',
            onRequest: [
                this.routerGuard.checkToken,
                (request, response) => {
                    const body = request.body;
                    const projectId = request.params.projectId;
                    // @ts-ignore
                    const valid = !!(projectId && request.uid);
                    if (valid) {
                        this.projects
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
