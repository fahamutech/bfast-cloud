import {bfast} from "bfastnode";

// export class LandingRouter implements RestRouterAdapter {
const prefix = '/';


/**
 *  rest: / -X GET
 *  input: N/A
 *  output: json
 * @private
 */
export const landing = bfast.functions().onGetHttpRequest(`${prefix}`, [
        (request, response) => {
            response.status(200).json({message: 'welcome to secured bfast::cloud'});
        }
    ]
);

/**
 *  rest: /ui/password/reset/?token= -X GET
 *  input: N/A
 *  output: HTML
 * @private
 */
export const resetPasswordUi = bfast.functions().onGetHttpRequest('/ui/password/reset/', [
        _routerGuard.checkToken,
        (request, response) => {
            const html = _resources.getHTML('reset-password');
            response.status(200).send(html);
        }
    ]
);

