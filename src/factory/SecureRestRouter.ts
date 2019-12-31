import {BFastSecurity} from "./SecurityFactory";

// need to be modified
export abstract class SecureRestRouter extends BFastSecurity {

    checkToken(request: any, response: any, next: any) {
        const header = request.headers['authorization'];

        if (header) {
            const bearer = header.split(' ');
            const token = bearer[1];
            this.verifyToken(token)
                .then(value => {
                    request.uid = value.uid ? value.uid : null;
                    next();
                }).catch(reason => {
                console.log(reason);
                response.status(401).json({message: 'Unauthorized request', reason: reason.toString()})
            });
        } else {
            //If header is undefined return Forbidden (403)
            response.status(401).json({message: 'Identify yourself'})
        }
    }

}
