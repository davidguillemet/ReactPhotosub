module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/admin/destinations", config.isAuthenticated, config.isAuthorized(["admin"]));

    const fetchAllDestinations = (req, res, next) => {
        // See https://firebase.google.com/docs/storage/web/download-files
        return config.pool().select("d.*")
            .from({d: "destinations_with_regionpath"})
            .orderBy("d.date", "desc")
            .then((destinations) => {
                destinations.forEach((destination) => {
                    // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                    destination.cover = config.convertPathToUrl(destination.path + "/" + destination.cover);
                });
                res.json(destinations);
            }).catch((err) => {
                config.logger.error("Failed to load destinations.", err);
                res.status(500)
                    .send("Failed to load destinations.")
                    .end();
            });
    };

    config.app.route("/admin/destinations")
        // Create a new destination (admin task)
        .post(async function(req, res, next) {
            const newDestination = req.body;

            try {
                await config.pool("destinations").returning("id").insert(newDestination);
            } catch (err) {
                config.logger.error(`Failed to insert destination ${newDestination.title} / ${newDestination.path}.`, err);
                res.status(500).send(`Error while inserting destination ${newDestination.title} / ${newDestination.path}.`).end();
                return;
            }

            return fetchAllDestinations(req, res, next);
        })
        // Update the specified destination
        .put(async function(req, res, next) {
            const destination = req.body;

            try {
                await config.pool("destinations")
                    .where("id", destination.id)
                    .update({
                        "title": destination.title,
                        "date": destination.date,
                        "location": destination.location,
                        "path": destination.path,
                        "cover": destination.cover,
                        "macro": destination.macro,
                        "wide": destination.wide,
                    });
            } catch (err) {
                config.logger.error(`Failed to update destination ${destination.title} / ${destination.path}.`, err);
                res.status(500).send(`Error while updating destination ${destination.title} / ${destination.path}.`).end();
                return;
            }

            return fetchAllDestinations(req, res, next);
        })
        // Delete a destination (admin task)
        .delete(function(req, res, next) {
            const removedDestination = req.body;
            config.pool("destinations")
                .where("id", removedDestination.id)
                .del()
                .then(() => {
                    res.status(200).send({id: removedDestination.id}).end();
                }).catch((err) => {
                    config.logger.error(`Failed to delete destination ${removedDestination.id}.`, err);
                    res.status(500).send(`Failed to delete destination ${removedDestination.id}.`).end();
                });
        });

    // Get all Destinations
    // including the region identifier through an inner join with the locations table
    // ==> select destinations.*, locations.region from destinations inner join locations on destinations.location = locations.id
    config.app.route("/destinations").get(fetchAllDestinations);

    config.app.route("/destinations/related")
        .get(function(req, res, next) {
            const region = req.query.region;
            // If only one region, region parameter is not an array...
            const regions =
                Array.isArray(region) ?
                    region :
                    [region];

            const macro = req.query.macro;
            const wide = req.query.wide;
            // Only compare the root region (South-east asia, sousth-africa, ...)
            const rootRegion = regions[regions.length - 1];

            config.pool().select("destinations_with_regionpath.*")
                .from("destinations_with_regionpath")
                // destinations_with_regionpath.regionpath is the region array from lowest to highest level [raja, indo, asie]
                // To get related regions we test if the last element of regionpath (e.g. asie) is the same as the last element of the specified region path (req.query.region)
                .whereRaw("(destinations_with_regionpath.regionpath[array_length(destinations_with_regionpath.regionpath, 1)]::json->>'id')::INTEGER = ?", [rootRegion])
                .andWhere((builder) => {
                    builder.where("destinations_with_regionpath.macro", macro).orWhere("destinations_with_regionpath.wide", wide);
                })
                .orderBy("destinations_with_regionpath.date", "desc")
                .then((destinations) => {
                    destinations.forEach((destination) => {
                        // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                        destination.cover = config.convertPathToUrl(destination.path + "/" + destination.cover);
                    });
                    res.json(destinations);
                }).catch((err) => {
                    config.logger.error("Failed to load related destinations", err);
                    res.status(500)
                        .send("Failed to load related destinations.")
                        .end();
                });
        });
};
