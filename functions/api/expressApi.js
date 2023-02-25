// See https://firebase.google.com/docs/hosting/functions

// loads environment variables from a .env
require("dotenv").config();

const express = require("express");
const compression = require("compression");
const {convertPathToUrl, bucket, logger} = require("../utils/firebase");
const {isAuthenticated, isAuthorized} = require("./middlewares/authenticated");
const appCheckVerification = require("./middlewares/appCheckVerification");
const cors = require("cors");

// Get a connection pool for postgreSql
const {pool} = require("../utils/pool-postgresql");

// Build express app
const app = express();

// app.use(mw);

app.use(compression());

// support parsing of application/json type post data
app.use(express.json());

// support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({extended: true}));

// Fix the CORS Error
app.use(cors({origin: true}));

// Firebase appCheck verification
app.use(appCheckVerification);

const resourceConfiguration = {
    app,
    pool,
    convertPathToUrl,
    bucket,
    logger,
    isAuthenticated,
    isAuthorized,
};

require("./resources/destinations")(resourceConfiguration);
require("./resources/destination")(resourceConfiguration);
require("./resources/locations")(resourceConfiguration);
require("./resources/regions")(resourceConfiguration);
require("./resources/images")(resourceConfiguration);
require("./resources/userdata")(resourceConfiguration);
require("./resources/favorites")(resourceConfiguration);
require("./resources/simulations")(resourceConfiguration);
require("./resources/bucket")(resourceConfiguration);
require("./resources/search")(resourceConfiguration);
require("./resources/message")(resourceConfiguration);
require("./resources/user")(resourceConfiguration);

app.get("/status", (req, res) => res.send("Working!"));

// In case we would like to take advantage of this generic error handler
// just add a try/catch in a route handler and call next in a promise catch statement:
// promise.then((...) => { ... }).catch(next);
// -> https://www.robinwieruch.de/node-express-error-handling
// be catch here and we will send an internal server error http 500
// response with the error message as the response body
app.use((error, req, res, next) => {
    logger.error(res.locals.errorMessage, error);
    return res.status(500).json({
        error: {
            message: res.locals.errorMessage,
        },
    });
});

const mainapi = express();
mainapi.use("/api", app);

exports.mainapi = mainapi;
