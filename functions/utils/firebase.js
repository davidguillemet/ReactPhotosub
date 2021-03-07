const admin = require("firebase-admin");
const functions = require("firebase-functions");

const configFunctions = functions.config();

if (configFunctions.env === "remote-dev") {
    const serviceAccount = require("../../../gcp/photosub-firebase-adminsdk-8x9sm-78af4aa631.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    admin.initializeApp();
}

const bucket = admin.storage().bucket("photosub.appspot.com");

function convertPathToUrl(imagePath) {
    if (configFunctions.env !== "local-dev") {
        // Return file from Google cloud if "production" Or "remote-dev"
        return bucket.file(imagePath).publicUrl();
    } else {
        // return a local path for "local-dev"
        return "/static-storage/" + imagePath;
    }
}

module.exports = convertPathToUrl;
