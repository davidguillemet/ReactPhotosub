module.exports = function(admin, config) {
    const fetchAllDestinations = require("../utils/fetchDestinations")(config);

    admin.route("/destinations")
        // Create a new destination (admin task)
        .post(async function(req, res, next) {
            const newDestination = req.body;
            res.locals.errorMessage = `Failed to insert destination ${newDestination.title}/${newDestination.path}.`;
            return config.pool("destinations")
                .returning("id")
                .insert(newDestination)
                .then(() => {
                    return fetchAllDestinations(req, res, next);
                })
                .catch(next);
        })
        // Update the specified destination
        .put(async function(req, res, next) {
            const destination = req.body;
            res.locals.errorMessage = `Failed to update destination ${destination.title}/${destination.path}.`;
            return config.pool("destinations")
                .where("id", destination.id)
                .update({
                    "title": destination.title,
                    "title_en": destination.title_en,
                    "date": destination.date,
                    "location": destination.location,
                    "path": destination.path,
                    "cover": destination.cover,
                    "macro": destination.macro,
                    "wide": destination.wide,
                }).then(() => {
                    return fetchAllDestinations(req, res, next);
                }).catch(next);
        })
        // Delete a destination (admin task)
        .delete(function(req, res, next) {
            const removedDestination = req.body;
            res.locals.errorMessage = `Failed to delete destination ${removedDestination.id}.`;
            return config.pool("destinations")
                .where("id", removedDestination.id)
                .del()
                .then(() => {
                    res.status(200).send({id: removedDestination.id}).end();
                }).catch(next);
        });
};
