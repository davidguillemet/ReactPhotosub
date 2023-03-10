// See https://firebase.google.com/docs/hosting/functions

// loads environment variables from a .env
require("dotenv").config();

const express = require("express");
const compression = require("compression");
const {convertPathToUrl, bucket, logger} = require("../utils/firebase");
const {isAuthenticated, isAuthorized} = require("./middlewares/authenticated");
const cors = require("cors");
// -> issue when keeping a browser tab idle, from instagram
//    in-app browser or with Prerender.io
// const appCheckVerification = require("./middlewares/appCheckVerification");

// Get a connection pool for postgreSql
const {pool} = require("../utils/pool-postgresql");

// Build express app
const mainapi = express();

// app.use(mw);

mainapi.use(compression());

// support parsing of application/json type post data
mainapi.use(express.json());

// support parsing of application/x-www-form-urlencoded post data
mainapi.use(express.urlencoded({extended: true}));

// Fix the CORS Error
mainapi.use(cors({origin: true}));

// Firebase appCheck verification
// mainapi.use(appCheckVerification);

const configuration = {
    pool,
    convertPathToUrl,
    bucket,
    logger,
    isAuthenticated,
    isAuthorized,
};

// standard api
const app = express();
require("./resources/destinations")(app, configuration);
require("./resources/destination")(app, configuration);
require("./resources/locations")(app, configuration);
require("./resources/regions")(app, configuration);
require("./resources/images")(app, configuration);
require("./resources/userdata")(app, configuration);
require("./resources/favorites")(app, configuration);
require("./resources/simulations")(app, configuration);
require("./resources/bucket")(app, configuration);
require("./resources/search")(app, configuration);
require("./resources/message")(app, configuration);
require("./resources/user")(app, configuration);

// Admin API
const admin = express();
require("./admin/expressAdmin")(admin, configuration);

mainapi.get("/status", (req, res) => res.send("Working!"));

// In case we would like to take advantage of this generic error handler
// just add a try/catch in a route handler and call next in a promise catch statement:
// promise.then((...) => { ... }).catch(next);
// -> https://www.robinwieruch.de/node-express-error-handling
// be catch here and we will send an internal server error http 500
// response with the error message as the response body
mainapi.use((error, req, res, next) => {
    logger.error(res.locals.errorMessage, error);
    return res.status(500).json({
        error: {
            message: res.locals.errorMessage,
        },
    });
});

app.use("/admin", admin);
mainapi.use("/api", app);

exports.mainapi = mainapi;
