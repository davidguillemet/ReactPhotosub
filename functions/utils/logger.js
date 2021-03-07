const {createLogger, transports} = require("winston");
const lw = require("@google-cloud/logging-winston");
const functions = require("firebase-functions");

const configFunctions = functions.config();

// See https://googleapis.dev/nodejs/logging-winston/latest/
function createLogginWinston() {
    let configuration = {
        serviceContext: {
            // required to report logged errors to the Google Cloud Error Reporting console
            service: "api-photosub",
        },
        prefix: "api-photosub",
    };

    if (configFunctions.env === "remote-dev") {
        configuration = {
            projectId: "photosub",
            keyFilename: "../../gcp/photosub-5c66182af76f.json",
            ...configuration,
        };
    }

    return new lw.LoggingWinston(configuration);
}

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
// See https://googleapis.dev/nodejs/logging-winston/latest/
const logger = createLogger({
    "level": "info",
    "transports": [],
});

const loggingWinston = createLogginWinston();

async function makeExpressLoggerMiddleware() {
    return await lw.express.makeMiddleware(logger, loggingWinston);
}

if (configFunctions.env === "remote-dev" || configFunctions.env === "local-dev") {
    logger.add(new transports.Console());
} else {
    logger.add(loggingWinston);
}

module.exports = {
    logger,
    makeExpressLoggerMiddleware,
};
