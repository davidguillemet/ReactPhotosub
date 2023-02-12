module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/admin/locations", config.isAuthenticated, config.isAuthorized(["admin"]));

    const fetchAllLocations = (req, res, next) => {
        res.locals.errorMessage = "Failed to load locations.";
        return config.pool().select()
            .table("locations")
            .orderBy("title", "asc")
            .then((data) => {
                res.json(data);
            }).catch(next);
    };

    // Get all locations
    config.app.route("/locations").get(fetchAllLocations);

    config.app.route("/admin/locations")
        // Create a new location (admin task)
        .post(async function(req, res, next) {
            const newLocation = req.body;
            res.locals.errorMessage = `Failed to insert location '${newLocation.title}'.`;
            return config.pool("locations")
                .returning("id")
                .insert(newLocation)
                .then(() => {
                    return fetchAllLocations(req, res, next);
                })
                .catch(next);
        })
        // Update the specified location
        .put(async function(req, res, next) {
            const location = req.body;
            res.locals.errorMessage = `Failed to update location '${location.title}'.`;
            return config.pool("locations")
                .where("id", location.id)
                .update({
                    "title": location.title,
                    "region": location.region,
                    "latitude": location.latitude,
                    "longitude": location.longitude,
                    "link": location.link,
                }).then(() => {
                    return fetchAllLocations(req, res, next);
                }).catch(next);
        })
        // Delete a location (admin task)
        .delete(function(req, res, next) {
            const removedLocation = req.body;
            res.locals.errorMessage = `Failed to delete location ${removedLocation.id}.`;
            return config.pool("locations")
                .where("id", removedLocation.id)
                .del()
                .then(() => {
                    res.status(200).send({id: removedLocation.id}).end();
                }).catch(next);
        });
};
