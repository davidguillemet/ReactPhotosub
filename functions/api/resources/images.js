module.exports = function(config) {
    config.app.route("/images/folders")
        .get(function(req, res, next) {
            // select distinct path
            // from images
            // where path not in (select distinct path from destinations)
            config.pool("images")
                .distinct("path")
                .orderBy("path", "asc")
                .then((result) => {
                    res.json(result);
                }).catch((err) => {
                    config.logger.error("Failed to get image folders.", err);
                    res.status(500)
                        .send("Unable to get image folders.")
                        .end();
                });
        });

    // Get number of images
    config.app.route("/images")
        .get(function(req, res, next) {
            config.pool("images").count("id as CNT").then((total) => {
                res.json({
                    count: total[0].CNT,
                });
            }).catch((err) => {
                config.logger.error("Failed to get count of images.", err);
                res.status(500)
                    .send("Unable to get image count.")
                    .end();
            });
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
            config
                .pool("images")
                .insert(newImage)
                .onConflict(["name", "path"])
                .merge()
                .then(() => {
                    res.status(200).send(`Successfully inserting image ${fileFullPath}.`).end();
                })
                .catch((err) => {
                    config.logger.error(`Failed to insert image ${fileFullPath}.`, err);
                    res.status(500).send(`Error while inserting image ${fileFullPath}.`).end();
                });
        })
        // Delete an image
        .delete(async function(req, res, next) {
            // {
            //     name: "DSC_6578.jpg",
            //     path: "/folder/folder/",
            // }
            const imgeToDelete = req.body;
            const fileFullPath = `${imgeToDelete.path}/${imgeToDelete.name}`;
            try {
                await config.pool("images").where({
                    path: imgeToDelete.path,
                    name: imgeToDelete.name,
                }).delete();
                res.status(200).send(`Successfully deleting image ${fileFullPath}.`).end();
            } catch (err) {
                config.logger.error(`Failed to remove image ${fileFullPath}.`, err);
                res.status(500).send(`Error while deleting image ${fileFullPath}.`).end();
            }
        });
};
