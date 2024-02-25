module.exports = function(config) {
    const fetchAllSubGalleries = (destinationId, req, res, next) => {
        // See https://firebase.google.com/docs/storage/web/download-files
        res.locals.errorMessage = `Failed to load sub-galleries for destination ${destinationId}.`;
        return config.pool()
            .select("sub_galleries.*", "locations.title as location_title", "locations.latitude", "locations.longitude")
            .from("sub_galleries")
            .where("destination_id", destinationId)
            .leftJoin("locations", "sub_galleries.location", "locations.id")
            .orderBy("index")
            .then((subGalleries) => {
                res.json(subGalleries);
            }).catch(next);
    };

    return fetchAllSubGalleries;
};
