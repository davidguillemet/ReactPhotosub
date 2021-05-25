// See https://firebase.google.com/docs/hosting/functions

// loads environment variables from a .env
require("dotenv").config();

const express = require("express");
const {logger/* , makeExpressLoggerMiddleware */} = require("../utils/logger");
const {convertPathToUrl, bucket} = require("../utils/firebase");
const isAuthenticated = require("./authenticated");

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
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

const resourceConfiguration = {
    app,
    pool,
    convertPathToUrl,
    bucket,
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

app.get("/status", (req, res) => res.send("Working!"));

const mainapi = express();
mainapi.use("/api", app);

exports.mainapi = mainapi;
