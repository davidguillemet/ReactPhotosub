module.exports = function(config) {
    // Get all regions
    config.app.route("/regions")
        .get(function(req, res, next) {
            config.pool().select().table("regions").then((data) => {
                res.json(data);
            }).catch((err) => {
                config.logger.error("Failed to load regions.", err);
                res.status(500)
                    .send("Unable to load regions.")
                    .end();
            });
        });
};
