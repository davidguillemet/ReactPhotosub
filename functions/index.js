const functions = require("firebase-functions");
const {newFile, deleteFile} = require("./triggers/storageTriggers");
const {mainapi} = require("./api/expressApi");

exports.newImage = functions.storage.object().onFinalize(async (file) => {
    return newFile(file);
});

exports.deleteImage = functions.storage.object().onDelete(async (file) => {
    return deleteFile(file);
});

exports.mainapi = functions.https.onRequest(mainapi);
