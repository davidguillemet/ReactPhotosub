const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

if (process.env.NODE_ENV === "remote") {
    const serviceAccount = require("../../../gcp/photosub-firebase-adminsdk-8x9sm-78af4aa631.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    admin.initializeApp();
}

const bucket = admin.storage().bucket(process.env.FIREBASE_CONFIG.storageBucket);

function convertUrl(imageUrl) {
    // TODO : maybe remove decodeURI once the download Uri strategy has been refined...
    const decodedUri = decodeURIComponent(imageUrl);
    return process.env.FUNCTIONS_EMULATOR === "true" ?
        decodedUri.replace("127.0.0.1", process.env.REACT_APP_DEV_HOST) :
        decodedUri;
}

function convertPathToUrl(imagePath) {
    return convertPublicUrl(bucket.file(imagePath));
}

function convertPublicUrl(file) {
    return convertUrl(file.publicUrl());
}

module.exports = {
    convertPathToUrl: convertPathToUrl,
    convertPublicUrl: convertPublicUrl,
    bucket: bucket,
    // https://firebase.google.com/docs/functions/writing-and-viewing-logs
    // --> the Cloud Functions logger SDK is recommended for most situations
    logger: logger,
};
