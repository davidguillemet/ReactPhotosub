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

    const fetchAllSubGalleriesFromPath = (destinationPath, req, res, next) => {
        // See https://firebase.google.com/docs/storage/web/download-files
        // with destination_id as
        // (
        //     select "destinations"."id" as "destination_id"
        //     from "destinations"
        //     where "destinations"."path" = '2022/bajacalifornia'
        // )
        // select "sub_galleries".*, "locations"."title" as "location_title", "locations"."latitude", "locations"."longitude"
        // from "sub_galleries"
        // left join "locations" on "sub_galleries"."location" = "locations"."id"
        // where "sub_galleries"."destination_id" = (select destination_id from destination_id)
        // order by "index" asc

        res.locals.errorMessage = `Failed to load sub-galleries for destination ${destinationPath}.`;
        return config.pool()
            .with(
                "destination_id_from_path",
                config.pool("destinations")
                    .select("id")
                    .where("destinations.path", destinationPath))
            .select("sub_galleries.*", "locations.title as location_title", "locations.latitude", "locations.longitude")
            .from("sub_galleries")
            .whereRaw("sub_galleries.destination_id = (select id from destination_id_from_path)")
            .leftJoin("locations", "sub_galleries.location", "locations.id")
            .orderBy("index")
            .then((subGalleries) => {
                res.json(subGalleries);
            }).catch(next);
    };

    return {
        fetchAllSubGalleries,
        fetchAllSubGalleriesFromPath,
    };
};
