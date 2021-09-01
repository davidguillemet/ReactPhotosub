// See https://firebase.google.com/docs/hosting/functions

// loads environment variables from a .env
require("dotenv").config();

const express = require("express");
const {logger/* , makeExpressLoggerMiddleware */} = require("../utils/logger");
const {convertPathToUrl, bucket, settings} = require("../utils/firebase");
const isAuthenticated = require("./authenticated");
const cors = require("cors");

// Get a connection pool for postgreSql
const {pool} = require("../utils/pool-postgresql");

// DOC at https://googleapis.dev/nodejs/logging-winston/latest/
// Create a middleware that will use the provided logger.
// A Stackdriver Logging transport will be created automatically
// and added onto the provided logger.
// const mw = await makeExpressLoggerMiddleware();

// Build express app
const app = express();

// app.use(mw);

// support parsing of application/json type post data
app.use(express.json());

// support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({extended: true}));

// Fix the CORS Error
app.use(cors());

const resourceConfiguration = {
    app,
    pool,
    convertPathToUrl,
    bucket,
    settings,
    logger,
    isAuthenticated,
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
require("./resources/uploadedInteriors")(resourceConfiguration);
require("./resources/search")(resourceConfiguration);
require("./resources/message")(resourceConfiguration);

app.get("/status", (req, res) => res.send("Working!"));

// In case we would like to take advantage of this generic error handler
// just add a try/catch in a route handler and call next in a promise catch statement:
// promise.then((...) => { ... }).catch(next);
// -> https://www.robinwieruch.de/node-express-error-handling
// be cacthed here and we will send an internal server error http 500
// response with the error message as the response body
app.use((error, req, res, next) => {
    return res.status(500).json({error: error.toString()});
});

const mainapi = express();
mainapi.use("/api", app);

exports.mainapi = mainapi;
