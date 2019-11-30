import {BFastControllers} from "../controller";
import {RestRouterAdapter, RouterMethod, RouterModel} from "../adapters/restRouter";
import {RolesBasedRestRouter} from "../factory/RolesBasedRestRouter";

export class ProjectRouter extends RolesBasedRestRouter implements RestRouterAdapter {
    prefix: string = '/projects';

    getRoutes(): RouterModel[] {
        return [
            {
                name: 'getProjects',
                method: RouterMethod.GET,
                path: '/',
                onRequest: [
                    this.checkToken,
                    (request, response, _) => {
                        BFastControllers.projects().getProjectsOfUser(request.uid).then((value: any) => {
                            response.json(value);
                        }).catch((reason: any) => {
                            response.status(404).json(reason);
                        });
                    }
                ]
            },
            {
                name: 'getProject',
                method: RouterMethod.GET,
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
                method: RouterMethod.POST,
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
                method: RouterMethod.DELETE,
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
                name: 'pathProject',
                method: RouterMethod.PATCH,
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
