module.exports = function(app, config) {
    const fetchAllLocations = require("../utils/fetchLocations")(config);

    // Get all locations
    app.route("/locations").get(fetchAllLocations);
};
