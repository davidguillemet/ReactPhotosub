module.exports = function(app, config) {
    const fetchAllRegions = require("../utils/fetchRegions")(config);

    // Get all regions
    app.route("/regions").get(fetchAllRegions);
};
