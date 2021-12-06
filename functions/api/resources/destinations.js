module.exports = function(config) {
    // Get all Destinations
    // including the region identifier through an inner join with the locations table
    // ==> select destinations.*, locations.region from destinations inner join locations on destinations.location = locations.id
    config.app.route("/destinations")
        .get(function(req, res, next) {
            // See https://firebase.google.com/docs/storage/web/download-files
            config.pool().select("d.*")
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
        });

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
