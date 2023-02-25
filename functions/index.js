const functions = require("firebase-functions");
// const {newFile, deleteFile} = require("./triggers/storageTriggers");
const {deleteUser} = require("./triggers/authenticationTriggers");
const {mainapi} = require("./api/expressApi");
const {preRender} = require("./preRender");

exports.deleteUser = functions
    .runWith({secrets: ["CONFIG_APIKEY"]})
    .auth
    .user()
    .onDelete(async (user) => {
        return deleteUser(user);
    });

exports.mainapi = functions
    .runWith({secrets: [
        "MAIL_AUTH_PASS",
        "POSTGRESQL_PASSWORD",
        "RECAPTCHA_SECRETKEY",
        "RECAPTCHAV3_SECRETKEY",
    ]})
    .https
    .onRequest(mainapi);

exports.preRender = functions.https.onRequest(preRender);
