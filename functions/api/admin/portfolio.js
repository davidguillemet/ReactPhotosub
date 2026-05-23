module.exports = function(admin, config) {
    const fetchPortfolio = require("../utils/fetchPortfolio")(config);

    admin.route("/portfolio")
        // Add images in the portfolio from identifiers
        // ==> Update images based on the identifier and set the portfolio column as true
        .post(async function(req, res, next) {
            const {imageIds} = req.body;
            res.locals.errorMessage = `Failed to add images to portfolio with identifiers ${imageIds.join(", ")}.`;
            return config.pool("images")
                .whereIn("id", imageIds)
                .update({portfolio: true})
                .then(() => {
                    // Return a list that contains all the images that have been added in the portfolio
                    return fetchPortfolio(req, res, next, imageIds);
                }).catch(next);
        })
        // Delete images from the portfolio from identifiers
        // ==> Update images based on the identifier and set the portfolio column as null or false
        .delete(async function(req, res, next) {
            const {imageIds} = req.body;
            res.locals.errorMessage = `Failed to delete images from portfolio with identifiers ${imageIds.join(", ")}.`;
            return config.pool("images")
                .whereIn("id", imageIds)
                .update({portfolio: null})
                .then(() => {
                    res.status(200).json({ids: imageIds});
                }).catch(next);
        });
};
