import {BFastControllers} from "../controller";
import {RolesBasedRestRouter} from "../factory/RolesBasedRestRouter";
import {RestRouterAdapter, RestRouterMethod, RestRouterModel} from "../adapters/rest";

export class ProjectRouter extends RolesBasedRestRouter implements RestRouterAdapter {
    prefix: string = '/projects';

    getRoutes(): RestRouterModel[] {
        return [
            {
                name: 'getProjects',
                method: RestRouterMethod.GET,
                path: '/',
                onRequest: [
                    this.checkToken,
                    (request, response, _) => {
                        BFastControllers.projects().getUserProjects(request.uid).then((value: any) => {
                            response.json(value);
                        }).catch((reason: any) => {
                            response.status(404).json(reason);
                        });
                    }
                ]
            },
            {
                name: 'getProject',
                method: RestRouterMethod.GET,
                path: '/:projectId',
                onRequest: [
                    this.checkToken,
                    (request, response, next) => {
                        const valid = !!(request.uid && request.params.projectId);
                        if (valid) {
                            BFastControllers.projects().getUserProject(request.uid, request.params.projectId)
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
            },
            {
                name: 'createNewProject',
                method: RestRouterMethod.POST,
                path: '/',
                onRequest: [
                    this.checkToken,
                    /*check for payments if there is enough fund to proceed*/
                    async (request, response) => {
                        const body = request.body;
                        const valid = !!(request.uid && body && body.name && body.projectId && body.projectId !== 'cloud'
                            && body.projectId !== 'console' && body.projectId !== 'api'
                            && body.projectId !== 'dashboard' && body.description);
                        if (valid) {
                            try {
                                body.user = await BFastControllers.user().getUser(request.uid);
                                const project = await BFastControllers.projects().createProject(body);
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
            },
            {
                name: 'deleteProject',
                method: RestRouterMethod.DELETE,
                path: '/:projectId',
                onRequest: [
                    this.checkToken,
                    (request, response, _) => {
                        const projectId = request.params.projectId;
                        const valid = !!(projectId && request.uid);
                        if (valid) {
                            BFastControllers.projects().deleteUserProject(request.uid, projectId).then((value: any) => {
                                response.status(200).json(value);
                            }).catch((reason: any) => {
                                response.status(500).json(reason);
                            });
                        } else {
                            response.status(400).json({message: 'Input not valid'});
                        }
                    }
                ]
            },
            {
                name: 'patchProjectDetails',
                method: RestRouterMethod.PATCH,
                path: '/:projectId',
                onRequest: [
                    this.checkToken,
                    (request, response) => {
                        const body = request.body;
                        const projectId = request.params.projectId;
                        const valid = !!(projectId && request.uid);
                        if (valid) {
                            BFastControllers.projects().patchProjectDetails(request.uid, projectId, body).then((value: any) => {
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
        ]
    }
}
