module.exports = function(config) {
    // Get all locations
    config.app.route("/locations")
        .get(function(req, res, next) {
            res.locals.errorMessage = "Failed to load locations.";
            return config.pool().select().table("locations").then((data) => {
                res.json(data);
            }).catch(next);
        });
};
