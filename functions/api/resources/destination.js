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

module.exports = function(app, config) {
    const fetchAllSubGalleries = require("../utils/fetchSubGalleries")(config);

    // Get sub-galleries for a specific destination from identifier
    app.route("/destination/:id/galleries")
        .get(function(req, res, next) {
            return fetchAllSubGalleries(req.params.id, req, res, next);
        });

    // Get minimal destination info to get the desc (title, date, cover, location)
    app.route("/destination/:year/:title/desc")
        .get(function(req, res, next) {
            res.locals.errorMessage = `Failed to load description for destination '${getDestinationPath(req)}'`;
            return config.pool()
                .select("*")
                .from("destinations")
                .where("path", getDestinationPath(req))
                .then((destinations) => {
                    if (destinations.length > 0) {
                        const destination = destinations[0];
                        convertPath(destination, config);
                        res.json(destination);
                    } else {
                        // The destination does not exist,
                        // It may happen if an image exists in database
                        // while it has no associated destination yet
                        res.status(204).json(null);
                    }
                }).catch(next);
        });

    // Get a specific destination head from identifier, including region path
    app.route("/destination/:year/:title/head")
        .get(config.checkAuthentication, function(req, res, next) {
            res.locals.errorMessage = `Failed to load information for destination '${getDestinationPath(req)}'`;
            const isAdmin = config.isAdmin(res);
            const adminWhereClauseForPrevNext = isAdmin ? "" : " and destinations.published = true";
            return config.pool().raw(
                `WITH destination AS (
                    SELECT
                    d.title, d.title_en, d.date, d.cover, d.path, d.id, d.macro, d.wide, d.published, d.regionpath,
                    l.title as location, l.longitude, l.latitude, l.link, l.region
                    from locations l, destinations_with_regionpath d
                    where l.id = d.location and d.path = ?
                ),
                prevDest AS (
                    SELECT destinations.* from destinations, destination where destinations.date < destination.date ${adminWhereClauseForPrevNext} ORDER BY destinations.date DESC LIMIT 1
                ),
                nextDest AS (
                    SELECT destinations.* from destinations, destination where destinations.date > destination.date ${adminWhereClauseForPrevNext} ORDER BY destinations.date ASC LIMIT 1
                )
                SELECT d.title, d.title_en, d.date, d.cover, d.path, d.id, d.location, d.longitude, d.latitude, d.link, d.macro, d.wide, d.published, d.regionpath,
                       (select row_to_json(prevDest.*) from prevDest) as prev,
                       (select row_to_json(nextDest.*) from nextDest) as next
                from destination d`, getDestinationPath(req))
                .then((destinations) => {
                    if (destinations.rowCount === 0) {
                        // HTTP 404 : bad destination
                        res.sendStatus(404);
                    } else {
                        const destination = destinations.rows[0];
                        if (destination.published === false && isAdmin === false) {
                            // HTTP 401 : destination not published and not admin user
                            res.sendStatus(401);
                        } else {
                            convertPath(destination, config);
                            res.json(destination);
                        }
                    }
                }).catch(next);
        });

    // Get images for a specific destination from identifier
    app.route("/destination/:year/:title/images")
        .get(function(req, res, next) {
            res.locals.errorMessage = `Failed to load images for destination '${getDestinationPath(req)}'`;
            return config.pool({i: "images"})
                .select(config.pool().raw("i.id, i.name, i.path, i.title, i.description, i.\"sizeRatio\", i.create, i.tags, i.sub_gallery_id"))
                .where("i.path", getDestinationPath(req))
                .orderBy("i.create", "asc")
                .then((images) => {
                    images.forEach((image) => {
                        // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                        image.src = config.convertPathToUrl(image.path + "/" + image.name);
                    });
                    res.json(images);
                }).catch(next);
        });
};
