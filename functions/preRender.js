const functions = require("firebase-functions");
const express = require("express");
const preRender = require("prerender-node");

if (process.env.FUNCTIONS_EMULATOR === "true") {
    preRender.set("prerenderServiceUrl", "http://localhost:3000/");
} else {
    preRender.set("prerenderToken", process.env.PRERENDER_TOKEN);
}

const preRenderApp = express();
preRenderApp.use(preRender);

preRenderApp.get("*", (req, res) => {
    res.status(200).sendFile("index.html", {root: "./web"});
});

exports.preRender = functions
    .runWith({secrets: [
        "PRERENDER_TOKEN",
    ]})
    .https.onRequest(preRenderApp);
