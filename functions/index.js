// loads environment variables from a .env
require("dotenv").config();

const functions = require("firebase-functions");

// Get a connection pool for postgreSql
const {pool} = require("./utils/pool-postgresql");

const firebaseConfig = require("./utils/firebase");

// const {newFile, deleteFile} = require("./triggers/storageTriggers");
const {deleteUser} = require("./triggers/authenticationTriggers");
const mainapi = require("./api/expressApi")(pool, firebaseConfig);
const preRender = require("./preRender")(pool, firebaseConfig);

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

exports.preRender = functions
    .runWith({secrets: [
        "POSTGRESQL_PASSWORD",
    ]})
    .https
    .onRequest(preRender);
