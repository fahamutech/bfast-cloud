import bfastnode from "bfastnode";
import {passwordRestComponent} from "../components/password-reset.component.mjs";

const {bfast} = bfastnode;
const prefix = '/';


export const landingPage = bfast.functions().onGetHttpRequest(`${prefix}`, [
        (request, response) => {
            response.status(200).json({message: 'welcome to secured bfast::cloud'});
        }
    ]
);

export const resetPasswordUi = bfast.functions().onGetHttpRequest('/ui/password/reset/', [
        // _routerGuard.checkToken,
        (request, response) => {
            response.status(200).send(passwordRestComponent());
        }
    ]
);

