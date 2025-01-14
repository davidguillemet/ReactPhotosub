module.exports = function(config) {
    const fetchAllRegions = (req, res, next) => {
        res.locals.errorMessage = "Failed to load regions.";
        return config.pool().select().table("regions").then((data) => {
            res.json(data);
        }).catch(next);
    };

    return fetchAllRegions;
};
