module.exports = function(config) {
    const fetchAllLocations = (req, res, next) => {
        res.locals.errorMessage = "Failed to load locations.";
        return config.pool().select()
            .table("locations")
            .orderBy("title", "asc")
            .then((data) => {
                res.json(data);
            }).catch(next);
    };

    return fetchAllLocations;
};
