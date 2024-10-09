const admin = require("firebase-admin");
const functions = require("firebase-functions");

if (process.env.NODE_ENV === "remote") {
    const serviceAccount = require("../../../gcp/photosub-firebase-adminsdk-8x9sm-78af4aa631.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    admin.initializeApp();
}

const bucket = admin.storage().bucket(process.env.FIREBASE_CONFIG.storageBucket);

function convertPathToUrl(imagePath) {
    // TODO : maybe remove decodeURI once the download Uri strategy has been refined...
    const imageUrl = decodeURIComponent(bucket.file(imagePath).publicUrl());
    return process.env.FUNCTIONS_EMULATOR === "true" ?
        imageUrl.replace("127.0.0.1", process.env.REACT_APP_DEV_HOST) :
        imageUrl;
}

module.exports = {
    convertPathToUrl: convertPathToUrl,
    bucket: bucket,
    // https://firebase.google.com/docs/functions/writing-and-viewing-logs
    // --> the Cloud Functions logger SDK is recommended for most situations
    logger: functions.logger,
};
