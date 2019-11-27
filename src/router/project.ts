import {BFastControllers} from "../controller";
import {RestAdapter, RestRouteMethod} from "../adapters/rest";

export class ProjectRouter {
    private routerPrefix = '/project';

    constructor(private readonly restApi: RestAdapter) {
        this.getProjectsUi();
        this.getAllProjectOfUser();
        this.createNewProject();
        this.deleteProject();
    }

    private getProjectsUi() {
        this.restApi.mount(this.routerPrefix, {
            method: RestRouteMethod.GET,
            path: '/',
            onRequest: [
                (request: Request, response, next) => {
                    response.sendFile(`${__dirname}/../public/project/index.html`);
                }
            ]
        })
    }

    private getAllProjectOfUser() {
        this.restApi.mount(this.routerPrefix, {
            method: RestRouteMethod.POST,
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
        })
    }

    private createNewProject() {
        this.restApi.mount(this.routerPrefix, {
            method: RestRouteMethod.POST,
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
        })
    }

    private deleteProject() {
        this.restApi.mount(this.routerPrefix, {
            method: RestRouteMethod.DELETE,
            path: '/delete/:id',
            onRequest: [
                (request, response, _) => {
                    const projectId = request.params.id;
                    response.status(200).json({projectId});
                }
            ]
        })
    }
}
