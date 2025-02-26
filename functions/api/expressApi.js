// See https://firebase.google.com/docs/hosting/functions

const express = require("express");
const compression = require("compression");
const {isAuthenticated, isAuthorized, checkAuthentication, isAdmin} = require("./middlewares/authenticated");
const cors = require("cors");
// -> issue when keeping a browser tab idle, from instagram
//    in-app browser or with Prerender.io
// const appCheckVerification = require("./middlewares/appCheckVerification");

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

const getTableColumns = async (pool) => {
    const tableColumns = await pool().raw(`
        with table_names as (
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            and table_type != 'VIEW'
        ), column_names AS (
            SELECT table_name, column_name FROM information_schema.columns
            WHERE table_schema = 'public'
            and is_identity = 'NO'
            and table_name in (SELECT table_name from table_names)
        )
        SELECT table_name, array_agg(column_name::text) as columns
        FROM column_names
        GROUP BY table_name`);
    const columnMap = new Map();
    tableColumns.rows.forEach((row) => columnMap.set(row.table_name, row.columns));
    return columnMap;
};

// Firebase appCheck verification
// mainapi.use(appCheckVerification);
module.exports = function(pool, firebaseConfig) {
    const {logger} = firebaseConfig;
    let _tableColumns = null;
    const configuration = {
        pool,
        // Defer table columns retrieval to wait for the env variables being initialized
        // -> PostgreSQL related env variables
        getTableColumns: async (table) => {
            if (_tableColumns === null) {
                _tableColumns = await getTableColumns(pool);
            }
            return _tableColumns.get(table);
        },
        isAuthenticated,
        isAuthorized,
        checkAuthentication,
        isAdmin,
        ...firebaseConfig,
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
    const errorHandler = (error, req, res, next) => {
        logger.error(res.locals.errorMessage, error);
        return res.status(500).json({
            error: {
                message: res.locals.errorMessage,
                detail: error.message,
            },
        });
    };

    mainapi.use(errorHandler);
    admin.use(errorHandler);

    app.use("/admin", admin);
    mainapi.use("/api", app);

    return mainapi;
};
