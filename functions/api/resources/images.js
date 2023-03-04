module.exports = function(app, config) {
    app.route("/images/folders")
        .get(function(req, res, next) {
            // select distinct path
            // from images
            // where path not in (select distinct path from destinations)
            res.locals.errorMessage = "Failed to get image folders.";
            return config.pool("images")
                .distinct("path")
                .orderBy("path", "asc")
                .then((result) => {
                    res.json(result);
                }).catch(next);
        });

    // Get number of images
    app.route("/images")
        .get(function(req, res, next) {
            res.locals.errorMessage = "Failed to get number of images.";
            return config.pool("images").count("id as CNT").then((total) => {
                res.json({
                    count: total[0].CNT,
                });
            }).catch(next);
        });
};
