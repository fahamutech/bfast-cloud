import {bfast} from "bfastnode";


const prefix = '/projects/:projectId/database';

/**
 *  rest: /database/:projectId/image?force= -X POST
 *  headers:  -H'Authorization: token'
 *  body: {image: string}
 *  output: json
 * @private
 */
export const updateImage = bfast.functions().onPostHttpRequest(`${prefix}/image`, [
        routerGuard.checkToken,
        routerGuard.checkIsProjectOwner,
        routerGuard.checkPayment,
        (request, response) => {
            database.updateImage(
                request.params.projectId, request.body.image,
                request.query.force === 'true'
            ).then(value => {
                response.status(200).send(value);
            }).catch(reason => {
                response.status(503).json(reason);
            });
        }
    ]
);

/**
 *  rest: /database/:projectId/env?force= -X DELETE
 *  input:  -H'Authorization': token
 *  output: json
 * @private
 */
export const removeEnvironment = bfast.functions().onDeleteHttpRequest(`${prefix}/env`, [
        routerGuard.checkToken,
        routerGuard.checkIsProjectOwner,
        (request, response) => {
            const body = request.body;
            const valid = (body && body.envs && Array.isArray(body.envs) && body.envs.length > 0);
            if (valid) {
                database
                    .envRemove(request.params.projectId, request.body.envs, request.query.force === 'true').then(value => {
                    response.status(200).json({message: 'envs updated'});
                }).catch(reason => {
                    response.status(503).json({message: 'fails to remove envs', reason: reason.toString()});
                });
            } else {
                response.status(400).json({message: 'Nothing to update'})
            }
        }
    ]
);

/**
 *  rest: /database/:projectId/env?force= -X POST
 *  input:  -H'Authorization': token, --data json
 *  output: json
 * @private
 */
export const addEnvironment = bfast.functions().onPostHttpRequest(`${prefix}/env`, [
        routerGuard.checkToken,
        routerGuard.checkIsProjectOwner,
        (request, response) => {
            database
                .envAdd(request.params.projectId, request.body.envs, request.query.force === 'true').then(value => {
                response.status(200).json({message: 'envs updated'});
            }).catch(reason => {
                response.status(503).json({message: 'fails to add envs', reason: reason.toString()});
            });
        }
    ]
);
