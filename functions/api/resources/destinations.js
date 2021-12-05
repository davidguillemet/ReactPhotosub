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

    // To compare the complete region path instead of the location region only,
    // We can create a view that contains all destinations with the full region path as an array of region identifier
    // -> but doing this is equivalent as checking of the highest level region is the same or not...
    // DROP VIEW IF EXISTS destinationwithregionpath;
    // CREATE VIEW destinationwithregionpath AS (
    //     SELECT destinations.*, (
    //         WITH RECURSIVE regionpath AS (
    //                 SELECT
    //                 reg.id, reg.title, reg.parent
    //                 FROM regions reg
    //                 WHERE reg.id = locations.region
    //                 UNION ALL
    //                 SELECT r.id, r.title, r.parent
    //                 FROM regions r
    //                 JOIN regionpath ON r.id = regionpath.parent
    //             )
    //         SELECT ARRAY(select id from regionpath)
    //     ) as regionpath
    //     from locations, destinations
    //     where locations.id = destinations.location
    // );
    // select * from destinationwithregionpath;
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

            config.pool().select("destinations.*", "locations.region")
                .from("destinations")
                .join("locations", {"destinations.location": "locations.id"})
                .whereIn("locations.region", regions)
                .andWhere((builder) => {
                    builder.where("destinations.macro", macro).orWhere("destinations.wide", wide);
                })
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
