module.exports = function(config) {
    // Get all regions
    config.app.route("/regions")
        .get(function(req, res, next) {
            res.locals.errorMessage = "Failed to load regions.";
            return config.pool().select().table("regions").then((data) => {
                res.json(data);
            }).catch(next);
        });
};
