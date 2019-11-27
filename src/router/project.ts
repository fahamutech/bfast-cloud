import {BFastControllers} from "../controller";
import {RestRouterAdapter, RouterMethod, RouterModel} from "../adapters/restRouter";

export class ProjectRouter implements RestRouterAdapter {
    prefix: string = '/project';

    getRoutes(): RouterModel[] {
        return [
            {
                name: 'getProjectsUi',
                method: RouterMethod.GET,
                path: '/',
                onRequest: [
                    (request: Request, response, next) => {
                        response.sendFile(`${__dirname}/../public/project/index.html`);
                    }
                ]
            },
            {
                name: 'getAllProjectOfUser',
                method: RouterMethod.POST,
                path: '/all',
                onRequest: [
                    (request, response, _) => {
                        BFastControllers.projects.getUserProjects(request.body.uid).then((value: any) => {
                            response.json(value);
                        }).catch((reason: any) => {
                            response.status(404).json(reason);
                        });
                    }
                ]
            },
            {
                name: 'createNewProject',
                method: RouterMethod.POST,
                path: '/',
                onRequest: [
                    (request, response, _) => {
                        const body = request.body;
                        BFastControllers.projects.createProject(body).then((value: any) => {
                            delete value.fileUrl;
                            response.json(value);
                        }).catch((reason: any) => {
                            response.status(400).json(reason);
                        });
                    }
                ]
            },
            {
                name: 'deleteProject',
                method: RouterMethod.DELETE,
                path: '/delete/:id',
                onRequest: [
                    (request, response, _) => {
                        const projectId = request.params.id;
                        response.status(200).json({projectId});
                    }
                ]
            }
        ]
    }
}
