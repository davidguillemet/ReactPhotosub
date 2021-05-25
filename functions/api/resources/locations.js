module.exports = function(config) {
    // Get all locations
    config.app.route("/locations")
        .get(function(req, res, next) {
            config.pool().select().table("locations").then((data) => {
                res.json(data);
            }).catch((err) => {
                config.logger.error("Failed to load locations.", err);
                res.status(500)
                    .send("Failed to load locations.")
                    .end();
            });
        });
};
