const functions = require("firebase-functions");
const configFunctions = functions.config();
const verifyCustomTokenApiBaseUrl = "www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=" + configFunctions.config.apikey;

exports.apiBaseUrl =
    configFunctions.env === "local-dev" ?
        "http://localhost:5003/photosub/us-central1/mainapi" :
        "https://us-central1-photosub.cloudfunctions.net/mainapi";


exports.verifyCustomTokenApiUrl =
    configFunctions.env === "local-dev" ?
        "http://localhost:9099/" + verifyCustomTokenApiBaseUrl : // Emulator
        "https://" + verifyCustomTokenApiBaseUrl;

// https://firebase.google.com/docs/functions/writing-and-viewing-logs
// --> the Cloud Functions logger SDK is recommended for most situations
exports.logger = functions.logger;

exports.config = configFunctions;
