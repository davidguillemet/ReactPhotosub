module.exports = function(config) {
    const fetchAllDestinations = (req, res, next) => {
        // See https://firebase.google.com/docs/storage/web/download-files
        res.locals.errorMessage = "Failed to load destinations.";
        return config.pool().select("d.*")
            .from({d: "destinations_with_regionpath"})
            .orderBy("d.date", "desc")
            .where((builder) => {
                if (!config.isAdmin(res)) {
                    builder.where("d.published", true);
                }
            })
            .then((destinations) => {
                destinations.forEach((destination) => {
                    // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                    destination.cover = config.convertPathToUrl(destination.path + "/" + destination.cover);
                });
                res.json(destinations);
            }).catch(next);
    };

    return fetchAllDestinations;
};
