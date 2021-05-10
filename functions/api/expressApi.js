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

// Authentication required for the following routes:
app.use("/favorites", isAuthenticated);
app.use("/simulations", isAuthenticated);
app.use("/uploadedInteriors", isAuthenticated);

// support parsing of application/json type post data
app.use(express.json());

// support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({extended: true}));

// Fix the CORS Error
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Get all Destinations
// including the region identifier through an inner join with the locations table
// ==> select destinations.*, locations.region from destinations inner join locations on destinations.location = locations.id
app.route("/destinations")
    .get(function(req, res, next) {
        // See https://firebase.google.com/docs/storage/web/download-files
        pool().select("destinations.*", "locations.region").from("destinations").join("locations", {"destinations.location": "locations.id"})
            .then((destinations) => {
                destinations.forEach((destination) => {
                    // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                    destination.cover = convertPathToUrl(destination.path + "/" + destination.cover);
                });
                res.json(destinations);
            }).catch((err) => {
                logger.error("Failed to load destinations.", err);
                res.status(500)
                    .send("Failed to load destinations.")
                    .end();
            });
    });

// Get a specific destination head from identifier
app.route("/destination/:year/:title/head")
    .get(function(req, res, next) {
        pool({d: "destinations"})
            .select(
                "d.title", "d.date", "d.cover", "d.path", "d.id",
                "l.title as location", "l.longitude", "l.latitude", "l.link", "l.region")
            .where("d.path", `${req.params.year}/${req.params.title}`)
            .join("locations as l", {"d.location": "l.id"})
            .then((destinations) => {
                const destination = destinations[0];
                destination.cover = convertPathToUrl(destination.path + "/" + destination.cover);
                res.json(destination);
            }).catch((err) => {
                logger.error(`Failed to load destination with id = ${req.params.id}`, err);
                res.status(500)
                    .send("Failed to load destination.")
                    .end();
            });
    });

// Get images for a specific destination from identifier
app.route("/destination/:year/:title/images")
    .get(function(req, res, next) {
        pool({i: "images"}).select("i.id", "i.name", "i.path", "i.title", "i.description", "i.sizeRatio").join("destinations", {
            "destinations.path": pool().raw("?", [`${req.params.year}/${req.params.title}`]),
            "i.path": "destinations.path",
        }).orderBy("i.name", "asc").then((images) => {
            images.forEach((image) => {
                // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                image.src = convertPathToUrl(image.path + "/" + image.name);
            });
            res.json(images);
        }).catch((err) => {
            logger.error(`Failed to load destination with id = ${req.params.id}`, err);
            res.status(500)
                .send("Failed to load destination.")
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
    // Get number of images
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
    //     captionTags: [ "tag1", "tag2", ...],
    //     width: 600,
    //     height: 400,
    //     sizeRatio: 1.5
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

app.route("/userdata/:uid")
    // Get all data for a given user
    .get(async function(req, res, next) {
        try {
            // get only favorite identifiers for the current user
            // -> we will fetch simulations on demand
            const dataArray = await pool("user_data").select("favorites").where("uid", req.params.uid);
            let data = null;
            if (dataArray.length === 0) {
                // No entry for current user yet.
                // insert an empty one
                data = {
                    uid: req.params.uid,
                    favorites: [], // favorites is an array field that we initialize with an empty array
                    simulations: "[]", // simulations is a jsonb field that we initialize with an empty array
                };
                await pool("user_data").insert(data);
            } else {
                data = dataArray[0];
            }
            res.json(data);
        } catch (err) {
            logger.error(`Failed to load user data for uid ${req.params.uid}.`, err);
            res.status(500)
                .send(`Unable to load user data for uid ${req.params.uid}.`)
                .end();
        }
    });

app.route("/userdata")
    .delete(async function(req, res, next) {
    // {
    //     uid: "xxxxxxxxxx",
    //     displayName: "cccccccc"
    // }
        const userInfo = req.body;
        try {
            await pool("user_data").where({
                uid: userInfo.uid,
            }).delete();
            res.status(200).send(`Successfully deleting data for user ${userInfo.displayName}.`).end();
        } catch (err) {
            logger.error(`Failed to remove data for user ${userInfo.displayName}.`, err);
            res.status(500).send(`Error while deleting data for user ${userInfo.displayName}.`).end();
        }
    });

// Get, Add and Delete favorites
app.route("/favorites")
    // Get all favorites for the current user
    .get(async function(req, res, next) {
        try {
            const images = await pool({i: "images"})
                .select("i.id", "i.name", "i.path", "i.title", "i.description", "i.sizeRatio")
                .join(pool().raw(`user_data as u ON u.uid = '${res.locals.uid}' and concat(i.path, '/', i.name) = ANY(u.favorites)`))
                .orderBy("i.name", "asc");

            images.forEach((image) => {
                // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                image.src = convertPathToUrl(image.path + "/" + image.name);
            });
            res.json(images);
        } catch (err) {
            logger.error(`Failed to get favorites for user ${res.locals.uid}.`, err);
            res.status(500).send(`Failed to get favorites for user ${res.locals.uid}.`).end();
        }
    })
    // Add a favorite for a given user
    .post(async function(req, res, next) {
        const newFavorite = req.body;
        try {
            const result = await pool()
                .raw(`update user_data set favorites = array_append(favorites, '${newFavorite.path}') where uid = '${res.locals.uid}' returning favorites`);
            res.json(result.rows[0].favorites);
        } catch (err) {
            logger.error(`Failed to add ${newFavorite.path} in favorites for user ${res.locals.uid}.`, err);
            res.status(500).send(`Failed to add ${newFavorite.path} in favorites for user ${res.locals.uid}.`).end();
        }
    })
    // Remove a favorite for a given user
    .delete(async function(req, res, next) {
        const removedFavorite = req.body;
        try {
            const result = await pool()
                .raw(`update user_data set favorites = array_remove(favorites, '${removedFavorite.path}') where uid = '${res.locals.uid}' returning favorites`);
            res.json(result.rows[0].favorites);
        } catch (err) {
            logger.error(`Failed to remove ${removedFavorite.path} in favorites for user ${res.locals.uid}.`, err);
            res.status(500).send(`Failed to remove ${removedFavorite.path} in favorites for user ${res.locals.uid}.`).end();
        }
    });

app.route("/simulations")
    // get all simulations
    .get(async function(req, res, next) {
        try {
            const dataArray = await pool("user_data").select("simulations").where("uid", res.locals.uid);
            let data = [];
            if (dataArray.length > 0) {
                data = dataArray[0];
            }
            res.json(data);
        } catch (err) {
            logger.error(`Failed to load simulations for uid ${req.params.uid}.`, err);
            res.status(500)
                .send(`Unable to load simulations for uid ${req.params.uid}.`)
                .end();
        }
    })
    // Add or update a simulation for the authenticated user
    .post(async function(req, res, next) {
        const newSimulation = req.body;
        const newSimulationString = JSON.stringify(newSimulation);
        try {
            let result = null;
            if (newSimulation.dbindex === null || newSimulation.dbindex === undefined) {
                // Add a simulation
                result = await pool()
                    .raw(`update user_data set simulations = simulations::jsonb || '${newSimulationString}'::jsonb where uid = '${res.locals.uid}' returning simulations`);
                res.json(result.rows[0].simulations);
            } else {
                // Update a simulation from its index
                result = await pool()
                    .raw(`update user_data set simulations = jsonb_set(simulations, '{${newSimulation.dbindex}}', '${newSimulationString}', false) where uid = '${res.locals.uid}' returning simulations`);
            }
            res.json(result.rows[0].simulations);
        } catch (err) {
            logger.error(`Failed to add a new simulation for user ${res.locals.uid}.`, err);
            res.status(500).send(`Failed to add a new simulation for user ${res.locals.uid}.`).end();
        }
    })
    // Remove a simulation for the authenticated user
    .delete(async function(req, res, next) {
        const deleteData = req.body;
        try {
            const result = await pool()
                .raw(`update user_data set simulations = simulations - ${deleteData.dbindex}' where uid = '${res.locals.uid}' returning simulations`);
            res.json(result.rows[0].simulations);
        } catch (err) {
            logger.error(`Failed to remove simulation #${deleteData.dbindex} for user ${res.locals.uid}.`, err);
            res.status(500).send(`Failed to remove simulation #${deleteData.dbindex} for user ${res.locals.uid}.`).end();
        }
    });

app.route("/bucket/:folder")
    .get(async function(req, res, next) {
        // Get images from a bucket folder
        bucket.getFiles({
            prefix: `${req.params.folder}/`,
            delimiter: "/",
        }).then((filesResponse) => {
            const [files] = filesResponse;
            res.json(files
                .filter((file) => file.metadata.contentType.startsWith("image/"))
                .map((file) => file.publicUrl()));
        }).catch((err) => {
            logger.error(`Failed to load images from ${req.params.folder}`, err);
            res.status(500)
                .send(`Failed to load images from ${req.params.folder}`)
                .end();
        });
    });

app.route("/uploadedInteriors")
    .get(async function(req, res, next) {
        // Get all uploaded files under the "userUpload/<uid>/interiors" folder in the current bucket
        bucket.getFiles({
            prefix: `userUpload/${res.locals.uid}/interiors/`,
            delimiter: "/",
        }).then((filesResponse) => {
            const [files] = filesResponse;
            res.json(files
                .filter((file) => file.metadata.contentType.startsWith("image/"))
                .map((file) => file.publicUrl()));
        }).catch((err) => {
            logger.error("Failed to load user interiors.", err);
            res.status(500)
                .send("Failed to load user interiors.")
                .end();
        });
    })
    // Remove an uploaded interior
    .delete(async function(req, res, next) {
        const deleteData = req.body;
        const fileToDelete = deleteData.fileName;
        bucket.deleteFiles({
            prefix: `userUpload/${res.locals.uid}/interiors/${fileToDelete}`,
            delimiter: "/",
        }).then((filesResponse) => {
            res.status(200).send(`Successfully deleting image ${fileToDelete}.`).end();
        }).catch((err) => {
            logger.error(`Failed to delete the file ${fileToDelete}.`, err);
            res.status(500)
                .send(`Failed to delete the file ${fileToDelete}.`)
                .end();
        });
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
