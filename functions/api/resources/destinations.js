module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/admin/destinations", config.isAuthenticated, config.isAuthorized(["admin"]));

    const fetchAllDestinations = (req, res, next) => {
        // See https://firebase.google.com/docs/storage/web/download-files
        res.locals.errorMessage = "Failed to load destinations.";
        return config.pool().select("d.*")
            .from({d: "destinations_with_regionpath"})
            .orderBy("d.date", "desc")
            .then((destinations) => {
                destinations.forEach((destination) => {
                    // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                    destination.cover = config.convertPathToUrl(destination.path + "/" + destination.cover);
                });
                res.json(destinations);
            }).catch(next);
    };

    config.app.route("/admin/destinations")
        // Create a new destination (admin task)
        .post(async function(req, res, next) {
            const newDestination = req.body;
            res.locals.errorMessage = `Failed to insert destination ${newDestination.title}/${newDestination.path}.`;
            return config.pool("destinations")
                .returning("id")
                .insert(newDestination)
                .then(() => {
                    return fetchAllDestinations(req, res, next);
                })
                .catch(next);
        })
        // Update the specified destination
        .put(async function(req, res, next) {
            const destination = req.body;
            res.locals.errorMessage = `Failed to update destination ${destination.title}/${destination.path}.`;
            return config.pool("destinations")
                .where("id", destination.id)
                .update({
                    "title": destination.title,
                    "date": destination.date,
                    "location": destination.location,
                    "path": destination.path,
                    "cover": destination.cover,
                    "macro": destination.macro,
                    "wide": destination.wide,
                }).then(() => {
                    return fetchAllDestinations(req, res, next);
                }).catch(next);
        })
        // Delete a destination (admin task)
        .delete(function(req, res, next) {
            const removedDestination = req.body;
            res.locals.errorMessage = `Failed to delete destination ${removedDestination.id}.`;
            return config.pool("destinations")
                .where("id", removedDestination.id)
                .del()
                .then(() => {
                    res.status(200).send({id: removedDestination.id}).end();
                }).catch(next);
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

            res.locals.errorMessage = "Le chargement des destinations similaires a échoué.";

            return config.pool().select("destinations_with_regionpath.*")
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
                }).catch(next);
        });
};
