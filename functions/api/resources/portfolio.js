module.exports = function(app, config) {
    const fetchPortfolio = require("../utils/fetchPortfolio")(config);

    // Get portfolio
    app.route("/portfolio")
        .get(async function(req, res, next) {
            return fetchPortfolio(req, res, next);
        });

    // Get portfolio categories
    app.route("/portfolio/categories")
        .get(async function(req, res, next) {
            res.locals.errorMessage = "Failed to load portfolio categories.";
            return config.pool().select().table("portfolioCategories").then((data) => {
                res.json(data);
            }).catch(next);
        });
};
