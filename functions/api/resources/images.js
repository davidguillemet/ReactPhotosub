const path = require("path");
const {createThumbnails} = require("../../triggers/resizeImage");
const {extractExif} = require("../../triggers/exifProcessing");

module.exports = function(config) {
    const insertImage = (newImage, req, res, next) => {
        const fileFullPath = `${newImage.path}/${newImage.name}`;
        res.locals.errorMessage = `Failed to insert image ${fileFullPath}.`;
        return config.pool("images")
            .insert(newImage)
            .onConflict(["name", "path"])
            .merge()
            .then(() => {
                res.status(200).send(`Successfully inserting image ${fileFullPath}.`).end();
            }).catch(next);
    };

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

    config.app.route("/images")
        // Insert a new image (called from the Storage trigger)
        .post(async function(req, res, next) {
            // req.body = {
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
            return insertImage(req.body, req, res, next).catch(next);
        })
        // Process an image from Storage and insert it in database (called from Admin page)
        .put(
            config.isAuthenticated, // Authentication required to refresh thumbnails
            config.isAuthorized(["admin"]), // Only the admin is authorized to refresh thumbnails
            async function(req, res, next) {
                // {
                //     fullPath: "/folder/folder/DSC_6578.jpg",
                // }
                const props = req.body;
                res.locals.errorMessage = `Failed to process image ${props.fullPath}.`;
                const file = config.bucket.file(props.fullPath);

                return file.download().then((data) => {
                    return data[0];
                }).then((fileContent) => {
                    return extractExif(file, fileContent);
                }).then((imageItem) => {
                    return insertImage(imageItem, req, res, next);
                }).catch(next);
            })
        // Delete an image
        .delete(
            config.isAuthenticated, // Authentication required to refresh thumbnails
            config.isAuthorized(["admin"]), // Only the admin is authorized to refresh thumbnails
            async function(req, res, next) {
                // {
                //     path: "/folder/folder/DSC_6578.jpg"
                // }
                const imageToDelete = req.body;
                const fileFullPath = imageToDelete.path;
                const pathProperties = path.parse(fileFullPath);
                res.locals.errorMessage = `Failed to delete image ${fileFullPath}.`;
                return config.pool("images").where(
                    {
                        path: pathProperties.dir,
                        name: pathProperties.base,
                    }).delete()
                    .then(() => {
                        res.status(200).send(`Successfully deleted image ${fileFullPath}.`).end();
                    }).catch(next);
            })
        // Patch an image = refresh thumbnails
        .patch(
            config.isAuthenticated, // Authentication required to refresh thumbnails
            config.isAuthorized(["admin"]), // Only the admin is authorized to refresh thumbnails
            async function(req, res, next) {
                // {
                //     fullPath: "/folder/folder/DSC_6578.jpg",
                // }
                const props = req.body;
                res.locals.errorMessage = `Failed to generate thumbnails for image ${props.fullPath}.`;

                const file = config.bucket.file(props.fullPath);

                return file.download().then((data) => {
                    return data[0];
                }).then((fileContent) => {
                    return createThumbnails(config.bucket, file, fileContent, "thumbs");
                }).then(() => {
                    res.status(200).send(`Successfully generated thumbnails for image ${props.fullPath}.`).end();
                }).catch(next);
            });
};
