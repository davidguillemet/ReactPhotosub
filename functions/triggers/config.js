const functions = require("firebase-functions");
const verifyCustomTokenApiBaseUrl = "www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=" + process.env.CONFIG_APIKEY;

exports.apiBaseUrl =
    process.env.FUNCTIONS_EMULATOR === "true" ?
        "http://localhost:5003/photosub/us-central1/mainapi" :
        "https://us-central1-photosub.cloudfunctions.net/mainapi";


exports.verifyCustomTokenApiUrl =
    process.env.FUNCTIONS_EMULATOR === "true" ?
        "http://" + process.env.FIREBASE_AUTH_EMULATOR_HOST + "/" + verifyCustomTokenApiBaseUrl : // Emulator
        "https://" + verifyCustomTokenApiBaseUrl;

// https://firebase.google.com/docs/functions/writing-and-viewing-logs
// --> the Cloud Functions logger SDK is recommended for most situations
exports.logger = functions.logger;
