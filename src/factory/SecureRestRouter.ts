import {BFastSecurity} from "./SecurityFactory";

const bFastSecurity = new BFastSecurity();

// need to be modified
export abstract class SecureRestRouter {

    checkToken(request: any, response: any, next: any) {
        const header = request.headers['authorization'];

        if (header) {
            const bearer = header.split(' ');
            const token = bearer[1];
            bFastSecurity.verifyToken(token)
                .then(value => {
                    request.uid = value.uid ? value.uid : null;
                    next();
                }).catch(reason => {
                console.log(reason);
                response.status(401).json({message: 'Unauthorized request', reason: reason.toString()})
            });
        } else {
            //If header is undefined return Forbidden (403)
            response.status(403).json({message: 'Identify yourself'})
        }
    }


}
