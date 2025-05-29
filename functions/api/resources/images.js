const imageSize = require("buffer-image-size");
const {createThumbnails} = require("../../triggers/resizeImage");

module.exports = function(app, config) {
    app.route("/images/folders")
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
    app.route("/images")
        .get(function(req, res, next) {
            res.locals.errorMessage = "Failed to get number of images.";
            return config.pool("images").count("id as CNT").then((total) => {
                res.json({
                    count: total[0].CNT,
                });
            }).catch(next);
        });

    app.route("/interiors")
        // Patch an interior = create thumbnails
        .patch(config.isAuthenticated, async function(req, res, next) {
            // {
            //     fullPath: "/folder/folder/DSC_6578.jpg",
            // }
            const props = req.body;
            res.locals.errorMessage = `Failed to generate thumbnails for image ${props.fullPath}.`;

            const file = config.bucket.file(props.fullPath);

            return file.download().then((data) => {
                return data[0];
            }).then((fileContent) => {
                const dimensions = imageSize(fileContent);
                const sizeRatio = dimensions.width / dimensions.height;
                const metaDataPromise = file.setMetadata({
                    metadata: {
                        sizeRatio: sizeRatio,
                    },
                }).then(() => sizeRatio);
                const createThumbsPromise = createThumbnails(config.bucket, file, fileContent, "thumbs");
                return Promise.all([metaDataPromise, createThumbsPromise]);
            }).then((values) => {
                const sizeRatio = values[0];
                res.json({sizeRatio: sizeRatio});
            }).catch(next);
        });
};
