const functions = require("firebase-functions");
const {newFile, deleteFile} = require("./triggers/storageTriggers");
const {deleteUser} = require("./triggers/authenticationTriggers");
const {mainapi} = require("./api/expressApi");
const {preRender} = require("./preRender");

exports.newImage = functions.storage.object().onFinalize(async (file) => {
    return newFile(file);
});

exports.deleteImage = functions.storage.object().onDelete(async (file) => {
    return deleteFile(file);
});

exports.deleteUser = functions.auth.user().onDelete(async (user) => {
    return deleteUser(user);
});

exports.mainapi = functions.https.onRequest(mainapi);

exports.preRender = functions.https.onRequest(preRender);
