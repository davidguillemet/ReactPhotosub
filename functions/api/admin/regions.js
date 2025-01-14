module.exports = function(admin, config) {
    const fetchAllRegions = require("../utils/fetchRegions")(config);

    admin.route("/regions")
        // Create a new region (admin task)
        .post(async function(req, res, next) {
            const newRegion = req.body;
            res.locals.errorMessage = `Failed to insert region '${newRegion.title}'.`;
            return config.pool("regions")
                .returning("id")
                .insert(newRegion)
                .then(() => {
                    return fetchAllRegions(req, res, next);
                })
                .catch(next);
        })
        // Update the specified region
        .put(async function(req, res, next) {
            const region = req.body;
            res.locals.errorMessage = `Failed to update region '${region.title}'.`;
            return config.pool("regions")
                .where("id", region.id)
                .update({
                    "title": region.title,
                    "title_en": region.title_en,
                    "parent": region.region,
                }).then(() => {
                    return fetchAllRegions(req, res, next);
                }).catch(next);
        })
        // Delete a region (admin task)
        .delete(function(req, res, next) {
            const removedRegion = req.body;
            res.locals.errorMessage = `Failed to delete region ${removedRegion.id}.`;
            return config.pool("regions")
                .where("id", removedRegion.id)
                .del()
                .then(() => {
                    res.status(200).send({id: removedRegion.id}).end();
                }).catch(next);
        });
};
