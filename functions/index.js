// loads environment variables from a .env
require("dotenv").config();

const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");

// Get a connection pool for postgreSql
const {pool} = require("./utils/pool-postgresql");

const firebaseConfig = require("./utils/firebase");

const mainapi = require("./api/expressApi")(pool, firebaseConfig);
const preRender = require("./preRender")(pool, firebaseConfig);

const configApiKey = defineSecret("CONFIG_APIKEY");
const mailAuthPass = defineSecret("MAIL_AUTH_PASS");
const postgreSqlPassword = defineSecret("POSTGRESQL_PASSWORD");
const reCaptchaSecretKey = defineSecret("RECAPTCHA_SECRETKEY");
const reCaptchaV3SecretKey = defineSecret("RECAPTCHAV3_SECRETKEY");

exports.mainapi = onRequest({secrets: [
    configApiKey,
    mailAuthPass,
    postgreSqlPassword,
    reCaptchaSecretKey,
    reCaptchaV3SecretKey,
]}, mainapi);

exports.preRender = onRequest({secrets: [postgreSqlPassword]}, preRender);
