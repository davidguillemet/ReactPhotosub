module.exports = function(admin, config) {
    const fetchPortfolio = require("../utils/fetchPortfolio")(config);
    const {getPortfolioCategoriesPropsToUpdate} = require("../utils/updateUtils")(config);

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
    admin.route("/portfolio/categories")
        // Add a portfolio category
        .post(async function(req, res, next) {
            const newCategory = req.body;
            res.locals.errorMessage = `Failed to add the portfolio category with key ${newCategory.key}.`;
            const propsToUpdate = await getPortfolioCategoriesPropsToUpdate(newCategory);
            return config.pool("portfolioCategories")
                .returning("id")
                .insert(propsToUpdate)
                .then((result) => {
                    const catId = result[0];
                    res.json({
                        ...propsToUpdate,
                        id: catId,
                    });
                })
                .catch(next);
        })
        // Update a portfolio category
        .put(async function(req, res, next) {
            const category = req.body;
            res.locals.errorMessage = `Failed to update the portfolio category with key ${category.key}.`;
            const propsToUpdate = await getPortfolioCategoriesPropsToUpdate(category);
            return config.pool("portfolioCategories")
                .where("id", category.id)
                .update(propsToUpdate)
                .then(() => {
                    res.json({
                        ...propsToUpdate,
                        id: category.id,
                    });
                })
                .catch(next);
        })
        // Delete a portfolio category
        .delete(async function(req, res, next) {
            const {category} = req.body;
            res.locals.errorMessage = `Failed to delete portfolio category with key ${category.key}.`;
            return config.pool("portfolioCategories")
                .where("id", category.id)
                .del()
                .then(() => {
                    res.status(200).end();
                }).catch(next);
        });
};
