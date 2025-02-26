// loads environment variables from a .env
require("dotenv").config();

const functionsV1 = require("firebase-functions/v1");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");

// Get a connection pool for postgreSql
const {pool} = require("./utils/pool-postgresql");

const firebaseConfig = require("./utils/firebase");

// const {newFile, deleteFile} = require("./triggers/storageTriggers");
const {deleteUser} = require("./triggers/authenticationTriggers");
const mainapi = require("./api/expressApi")(pool, firebaseConfig);
const preRender = require("./preRender")(pool, firebaseConfig);

exports.deleteUser = functionsV1
    .runWith({secrets: ["CONFIG_APIKEY"]})
    .auth
    .user()
    .onDelete(async (user) => {
        return deleteUser(user);
    });

const mailAuthPass = defineSecret("MAIL_AUTH_PASS");
const postgreSqlPassword = defineSecret("POSTGRESQL_PASSWORD");
const reCaptchaSecretKey = defineSecret("RECAPTCHA_SECRETKEY");
const reCaptchaV3SecretKey = defineSecret("RECAPTCHAV3_SECRETKEY");

exports.mainapi = onRequest({secrets: [
    mailAuthPass,
    postgreSqlPassword,
    reCaptchaSecretKey,
    reCaptchaV3SecretKey,
]}, mainapi);

exports.preRender = onRequest({secrets: [
    postgreSqlPassword,
]}, preRender);
