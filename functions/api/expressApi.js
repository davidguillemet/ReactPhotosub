// See https://firebase.google.com/docs/hosting/functions

// loads environment variables from a .env
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const {logger/* , makeExpressLoggerMiddleware */} = require("../utils/logger");
const convertPathToUrl = require("../utils/firebase");

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
app.use(bodyParser.json());

// support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({extended: true}));

// Fix the CORS Error
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Get all Destinations
app.route("/destinations")
    .get(function(req, res, next) {
    // TODO: convert cover property from '2014/misool/DSC_456.jpg' to a real url
    // See https://firebase.google.com/docs/storage/web/download-files
        pool().select().table("destinations").then((destinations) => {
            destinations.forEach((destination) => {
                destination.cover = convertPathToUrl(destination.path + destination.cover);
            });
            res.json(destinations);
        }).catch((err) => {
            logger.error("Failed to load destinations.", err);
            res.status(500)
                .send("Failed to load destinations.")
                .end();
        });
    });

// Get all locations
app.route("/locations")
    .get(function(req, res, next) {
        pool().select().table("locations").then((data) => {
            res.json(data);
        }).catch((err) => {
            logger.error("Failed to load locations.", err);
            res.status(500)
                .send("Failed to load locations.")
                .end();
        });
    });

// Get all regions
app.route("/regions")
    .get(function(req, res, next) {
        pool().select().table("regions").then((data) => {
            res.json(data);
        }).catch((err) => {
            logger.error("Failed to load regions.", err);
            res.status(500)
                .send("Unable to load regions.")
                .end();
        });
    });

app.route("/images")
    .get(function(req, res, next) {
        pool("images").count("id as CNT").then((total) => {
            res.json({
                count: total[0].CNT,
            });
        }).catch((err) => {
            logger.error("Failed to get count of images.", err);
            res.status(500)
                .send("Unable to get image count.")
                .end();
        });
    });

app.route("/image")
    // Insert a new image
    .post(async function(req, res, next) {
    // {
    //     name: "DSC_6578.jpg",
    //     path: "/folder/folder/",
    //     title: "image title",
    //     description: "image description",
    //     tags: [ "tag1", "tag2", ...],
    //     caption: "image caption",
    //     captionTags: [ "tag1", "tag2", ...]
    // };
        const newImage = req.body;
        const fileFullPath = `${newImage.path}/${newImage.name}`;
        try {
            await pool("images").insert(newImage);
            res.status(200).send(`Successfully inserting image ${fileFullPath}.`).end();
        } catch (err) {
            logger.error(`Failed to insert image ${fileFullPath}.`, err);
            res.status(500).send(`Error while inserting image ${fileFullPath}.`).end();
        }
    })
    // Delete an image
    .delete(async function(req, res, next) {
    // {
    //     name: "DSC_6578.jpg",
    //     path: "/folder/folder/",
    // }
        const imgeToDelete = req.body;
        const fileFullPath = `${imgeToDelete.path}/${imgeToDelete.name}`;
        try {
            await pool("images").where({
                path: imgeToDelete.path,
                name: imgeToDelete.name,
            }).delete();
            res.status(200).send(`Successfully deleting image ${fileFullPath}.`).end();
        } catch (err) {
            logger.error(`Failed to remove image ${fileFullPath}.`, err);
            res.status(500).send(`Error while deleting image ${fileFullPath}.`).end();
        }
    });


// Search for images
app.route("/search")
    .post(async function(req, res, next) {
        const searchData = req.body;
        const page = searchData.page;
        const query = searchData.query;
        const pageSize = searchData.pageSize;
        pool("images")
            .select("name", "path", "title", "description")
            .limit(pageSize).offset(page * pageSize)
            // title is written in french
            // description in english, but in franch "manta" is extracted as lexeme "mant"...
            // on the other hand stopwork as "the" or "le" are ignored only if we use a config "english" or "french"...
            .whereRaw(`to_tsvector('french', title) @@ to_tsquery('${query}')`)
            .then((results) => {
                res.json(results);
            }).catch((err) => {
                logger.error(`Failed to search images from query "${query}"`, err);
                res.status(500).send("Error while searching image.").end();
            });
    });

app.get("/status", (req, res) => res.send("Working!"));

const mainapi = express();
mainapi.use("/api", app);

exports.mainapi = mainapi;