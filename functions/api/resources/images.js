module.exports = function(config) {
    config.app.route("/images/folders")
        .get(function(req, res, next) {
            // select distinct path
            // from images
            // where path not in (select distinct path from destinations)
            res.locals.errorMessage = "Failed to get image folders.";
            return config.pool("images")
                .distinct("path")
                .orderBy("path", "asc")
                .then((result) => {
                    res.json(result);
                }).catch(next);
        });

    // Get number of images
    config.app.route("/images")
        .get(function(req, res, next) {
            res.locals.errorMessage = "Failed to get number of images.";
            return config.pool("images").count("id as CNT").then((total) => {
                res.json({
                    count: total[0].CNT,
                });
            }).catch(next);
        });

    config.app.route("/image")
        // Insert a new image
        .post(async function(req, res, next) {
            // {
            //     name: "DSC_6578.jpg",
            //     path: "/folder/folder/",
            //     title: "image title",
            //     description: "image description",
            //     tags: [ "tag1", "tag2", ...],
            //     caption: "image caption",
            //     captionTags: [ "tag1", "tag2", ...],
            //     width: 600,
            //     height: 400,
            //     sizeRatio: 1.5,
            //     create: "2020-02-28T03:13:00.690Z
            // };
            const newImage = req.body;
            const fileFullPath = `${newImage.path}/${newImage.name}`;
            res.locals.errorMessage = `Failed to insert image ${fileFullPath}.`;
            return config.pool("images")
                .insert(newImage)
                .onConflict(["name", "path"])
                .merge()
                .then(() => {
                    res.status(200).send(`Successfully inserting image ${fileFullPath}.`).end();
                })
                .catch(next);
        })
        // Delete an image
        .delete(async function(req, res, next) {
            // {
            //     name: "DSC_6578.jpg",
            //     path: "/folder/folder/",
            // }
            const imageToDelete = req.body;
            const fileFullPath = `${imageToDelete.path}/${imageToDelete.name}`;
            res.locals.errorMessage = `Failed to remove image ${fileFullPath}.`;
            return config.pool("images").where(
                {
                    path: imageToDelete.path,
                    name: imageToDelete.name,
                }).delete()
                .then(() => {
                    res.status(200).send(`Successfully deleting image ${fileFullPath}.`).end();
                }).catch(next);
        });
};
