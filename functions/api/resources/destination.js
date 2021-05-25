module.exports = function(config) {
    // Get a specific destination head from identifier
    config.app.route("/destination/:year/:title/head")
        .get(function(req, res, next) {
            config.pool({d: "destinations"})
                .select(
                    "d.title", "d.date", "d.cover", "d.path", "d.id",
                    "l.title as location", "l.longitude", "l.latitude", "l.link", "l.region")
                .where("d.path", `${req.params.year}/${req.params.title}`)
                .join("locations as l", {"d.location": "l.id"})
                .then((destinations) => {
                    const destination = destinations[0];
                    destination.cover = config.convertPathToUrl(destination.path + "/" + destination.cover);
                    res.json(destination);
                }).catch((err) => {
                    config.logger.error(`Failed to load destination with id = ${req.params.id}`, err);
                    res.status(500)
                        .send("Failed to load destination.")
                        .end();
                });
        });

    // Get images for a specific destination from identifier
    config.app.route("/destination/:year/:title/images")
        .get(function(req, res, next) {
            config.pool({i: "images"}).select("i.id", "i.name", "i.path", "i.title", "i.description", "i.sizeRatio").join("destinations", {
                "destinations.path": config.pool().raw("?", [`${req.params.year}/${req.params.title}`]),
                "i.path": "destinations.path",
            }).orderBy("i.name", "asc").then((images) => {
                images.forEach((image) => {
                    // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                    image.src = config.convertPathToUrl(image.path + "/" + image.name);
                });
                res.json(images);
            }).catch((err) => {
                config.logger.error(`Failed to load destination with id = ${req.params.id}`, err);
                res.status(500)
                    .send("Failed to load destination.")
                    .end();
            });
        });
};
