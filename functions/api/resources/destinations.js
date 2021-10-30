module.exports = function(config) {
    // Get all Destinations
    // including the region identifier through an inner join with the locations table
    // ==> select destinations.*, locations.region from destinations inner join locations on destinations.location = locations.id
    config.app.route("/destinations")
        .get(function(req, res, next) {
            // See https://firebase.google.com/docs/storage/web/download-files
            config.pool().select("destinations.*", "locations.region")
                .from("destinations")
                .join("locations", {"destinations.location": "locations.id"})
                .orderBy("destinations.date", "desc")
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
        });

    config.app.route("/destinations/related")
        .get(function(req, res, next) {
            const regions = req.query.region;
            config.pool().select("destinations.*", "locations.region")
                .from("destinations")
                .join("locations", {"destinations.location": "locations.id"})
                .whereIn("locations.region", regions)
                .orderBy("destinations.date", "desc")
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
