import request from "request";
import {CONSTANTS} from '../config';


exports.listVitals = function(req, res) {

    let session = req.session;

    if(session.auth) {
        let url = '/vitals';
        if(session.patToken) {
            request.get({
                headers: {
                    'Authorization' : 'Bearer '+ session.accessToken,
                    'x-patient-token' : session.patToken
                },
                url: CONSTANTS.REST_BASE_URL+url,
            }, function(err, response, body){
                if(err) {
                    res.sendStatus(500);
                }

                res.send(body);

            });

            return;

        }
    }

    res.sendStatus(401);


}