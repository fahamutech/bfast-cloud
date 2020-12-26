import {bfast} from "bfastnode";

const prefix = '/projects';

// constructor(private  options: BfastConfig) {
//     _options = this.options;
//     _routerGuard = this.options.routerGuard ?
//         this.options.routerGuard : new RouterGuardFactory(this.options);
//     _users = this.options.userStoreAdapter ?
//         this.options.userStoreAdapter : new UserStoreFactory(this.options);
//     _projects = new ProjectController(this.options);
// }

/**
 *  rest: /projects/:projectId -X GET
 *  input:  -H'Authorization': token,
 *  output: json
 * @private
 */
export const getProject = bfast.functions().onGetHttpRequest(`${prefix}/:projectId`, [
        _routerGuard.checkToken,
        (request, response, next) => {
            const valid = !!(request.uid && request.params.projectId);
            if (valid) {
                _projects.getUserProject(request.uid, request.params.projectId)
                    .then((project) => {
                        response.status(200).json(project);
                    })
                    .catch((reason) => {
                        response.status(404).json(reason);
                    });
            } else {
                response.status(400).json({message: 'Invalid data'})
            }
        }
    ]
);

/**
 *  rest: /projects/:type -X POST
 *  type can be bfast || ssm
 *  input:  -H'Authorization': token, --data json
 *  output: json
 * @private
 */
export const createNewProject = bfast.functions().onPostHttpRequest(`${prefix}/:type`, [
        _routerGuard.checkToken,
        // check is admin is a temporary middleware will be replaced
        // with a payment middleware
        _options.devMode ? (req, res, next) => {
            next();
        } : _routerGuard.checkIsAdmin,
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
                && body.hostDomain
                && body.hostDomain !== ''
                && body.hostDomain !== 'null'
                && body.hostDomain !== 'undefined'
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
);

/**
 *  rest: /projects/?skip=0&size=20 -X GET
 *  input:  -H'Authorization': token,
 *  output: json
 * @private
 */
export const getProjects = bfast.functions().onGetHttpRequest(`${prefix}`, [
        _routerGuard.checkToken,
        (request, response, _) => {
            // @ts-ignore
            _projects.getUserProjects(request.uid, 10000, 0).then((value) => {
                response.json(value);
            }).catch((reason) => {
                response.status(404).json(reason);
            });
        }
    ]
);

/**
 *  rest: /projects/:projectId -X DELETE
 *  input:  -H'Authorization': token
 *  output: json
 * @private
 */
export const deleteProject = bfast.functions().onDeleteHttpRequest(`${prefix}/:projectId`, [
        _routerGuard.checkToken,
        _routerGuard.checkIsProjectOwner,
        (request, response, _) => {
            const projectId = request.params.projectId;

            // @ts-ignore
            const valid = !!(projectId && request.uid);
            if (valid) {
                // @ts-ignore
                _projects.deleteUserProject(request.uid, projectId).then((value) => {
                    response.status(200).json(value);
                }).catch((reason) => {
                    response.status(500).json(reason);
                });
            } else {
                response.status(400).json({message: 'Input not valid'});
            }
        }
    ]
);

/**
 *  rest: /projects/:projectId -X PATCH
 *  input:  -H'Authorization': token, --data json
 *  output: json
 * @private
 */
export const patchProject = bfast.functions().onPutHttpRequest(`${prefix}/:projectId`, [
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
                }).catch((reason) => {
                    response.status(500).json(reason);
                });
            } else {
                response.status(400).json({message: 'Input not valid'});
            }
        }
    ]
);

export const addMemberToProject = bfast.functions().onPostHttpRequest(`${prefix}/:projectId/members`, [
        _routerGuard.checkToken,
        _routerGuard.checkIsProjectOwner,
        (request, response) => {
            const body = request.body;
            const projectId = request.params.projectId;
            _projects.addMemberToProject(projectId, body).then(value => {
                response.status(200).json(value);
            }).catch(reason => {
                response.status(400).json({message: 'member not added', reason: reason.toString()});
            });
        }
    ]
);
