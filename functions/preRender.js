const functions = require("firebase-functions");
const fs = require("fs");
const express = require("express");
const preRender = express();

preRender.use(require("prerender-node").set("prerenderToken", functions.config().prerender.token));

preRender.get("*", (req, res) => {
    res.status(200).send(fs.readFileSync("./web/index.html").toString());
});

exports.preRender = functions.https.onRequest(preRender);
