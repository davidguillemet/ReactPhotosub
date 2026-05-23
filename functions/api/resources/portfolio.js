module.exports = function(app, config) {
    const fetchPortfolio = require("../utils/fetchPortfolio")(config);

    // Get, Add and Delete favorites
    app.route("/portfolio")
        .get(async function(req, res, next) {
            return fetchPortfolio(req, res, next);
        });
};
