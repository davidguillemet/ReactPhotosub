module.exports = function(app, config) {
    const fetchAllDestinations = require("../utils/fetchDestinations")(config);

    // Get all Destinations
    // including the region identifier through an inner join with the locations table
    // ==> select destinations.*, locations.region from destinations inner join locations on destinations.location = locations.id
    app.route("/destinations").get(config.checkAuthentication, fetchAllDestinations);

    app.route("/destinations/related")
        // Add checkAuthentication middleware in case the destination is not published
        .get(config.checkAuthentication, function(req, res, next) {
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
                .andWhere((builder) => {
                    if (!config.isAdmin(res)) {
                        builder.where("destinations_with_regionpath.published", true);
                    }
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
