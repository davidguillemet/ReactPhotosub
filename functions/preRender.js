const functions = require("firebase-functions");
const express = require("express");
const preRender = require("prerender-node");

const configFunctions = functions.config();
if (configFunctions.env === "local-dev") {
    preRender.set("prerenderServiceUrl", "http://localhost:3000/");
} else {
    preRender.set("prerenderToken", configFunctions.prerender.token);
}

const preRenderApp = express();
preRenderApp.use(preRender);

preRenderApp.get("*", (req, res) => {
    res.status(200).sendFile("index.html", {root: "./web"});
});

exports.preRender = functions.https.onRequest(preRenderApp);
