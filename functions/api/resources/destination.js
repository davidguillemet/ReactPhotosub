function convertPath(destination, config) {
    if (destination) {
        destination.cover = config.convertPathToUrl(destination.path + "/" + destination.cover);
        if (destination.next) {
            convertPath(destination.next, config);
        }
        if (destination.prev) {
            convertPath(destination.prev, config);
        }
    } else {
        throw new Error("Unknown destination");
    }
}

function getDestinationPath(req) {
    return `${req.params.year}/${req.params.title}`;
}

module.exports = function(config) {
    // Get minimal destinatination info to get the desc (title, date, cover, location)
    config.app.route("/destination/:year/:title/desc")
        .get(function(req, res, next) {
            config.pool()
                .select("*")
                .from("destinations")
                .where("path", getDestinationPath(req))
                .then((destinations) => {
                    const destination = destinations[0];
                    convertPath(destination, config);
                    res.json(destination);
                }).catch((err) => {
                    config.logger.error(`Failed to load destination from path = '${getDestinationPath(req)}':`, err);
                    res.status(500)
                        .send(`Failed to load destination from path = ${getDestinationPath(req)}`)
                        .end();
                });
        });

    // Get a specific destination head from identifier, including region path
    config.app.route("/destination/:year/:title/head")
        .get(function(req, res, next) {
            config.pool().raw(
                `WITH destination AS (
                    SELECT
                    d.title, d.date, d.cover, d.path, d.id, d.macro, d.wide, d.regionpath,
                    l.title as location, l.longitude, l.latitude, l.link, l.region
                    from locations l, destinations_with_regionpath d
                    where l.id = d.location and d.path = ?
                ),
                prevDest AS (
                    SELECT destinations.* from destinations, destination where destinations.date < destination.date ORDER BY destinations.date DESC LIMIT 1
                ),
                nextDest AS (
                    SELECT destinations.* from destinations, destination where destinations.date > destination.date ORDER BY destinations.date ASC LIMIT 1
                )
                SELECT d.title, d.date, d.cover, d.path, d.id, d.location, d.longitude, d.latitude, d.link, d.macro, d.wide, d.regionpath,
                       (select row_to_json(prevDest.*) from prevDest) as prev,
                       (select row_to_json(nextDest.*) from nextDest) as next
                from destination d`, getDestinationPath(req))
                .then((destinations) => {
                    const destination = destinations.rows[0];
                    convertPath(destination, config);
                    res.json(destination);
                }).catch((err) => {
                    config.logger.error(`Failed to load destination path = '${getDestinationPath(req)}':`, err);
                    res.status(500)
                        .send("Failed to load destination.")
                        .end();
                });
        });

    // Get images for a specific destination from identifier
    config.app.route("/destination/:year/:title/images")
        .get(function(req, res, next) {
            config.pool({i: "images"}).select("i.id", "i.name", "i.path", "i.title", "i.description", "i.sizeRatio", "i.create").join("destinations", {
                "destinations.path": config.pool().raw("?", [getDestinationPath(req)]),
                "i.path": "destinations.path",
            }).orderBy("i.create", "asc").then((images) => {
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
