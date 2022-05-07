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

// TODO: replace hardcoded bucket name by process.env.FIREBASE_CONFIG.storageBucket
const bucket = admin.storage().bucket("photosub.appspot.com");

function convertPathToUrl(imagePath) {
    return bucket.file(imagePath).publicUrl();
}

module.exports = {
    convertPathToUrl: convertPathToUrl,
    bucket: bucket,
    settings: configFunctions,
};
