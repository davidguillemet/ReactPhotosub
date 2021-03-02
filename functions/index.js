const functions = require("firebase-functions");
const {newFile, deleteFile} = require("./storageTriggers");
const {mainapi} = require("./expressApi");

exports.newImage = functions.storage.object().onFinalize(async (file) => {
    return newFile(file);
});

exports.deleteImage = functions.storage.object().onDelete(async (file) => {
    return deleteFile(file);
});

exports.mainapi = functions.https.onRequest(mainapi);
