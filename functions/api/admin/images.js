const path = require("path");
const imageSize = require("buffer-image-size");
const {createThumbnails} = require("../../triggers/resizeImage");
const {extractExif, generateTagsFromDescription} = require("../../triggers/exifProcessing");

module.exports = function(admin, config) {
    const insertImage = (newImage, req, res, next) => {
        const fileFullPath = `${newImage.path}/${newImage.name}`;
        res.locals.errorMessage = `Failed to insert image ${fileFullPath}.`;
        return config.pool("images")
            .returning("id")
            .insert(newImage)
            .onConflict(["name", "path"])
            .merge()
            .then((result) => {
                const imageId = result[0];
                newImage.id = imageId;
                newImage.src = config.convertPathToUrl(newImage.path + "/" + newImage.name);
                res.json(newImage);
            }).catch(next);
    };

    const updateImageProperties = (image, req, res, next) => {
        const tagsFromTitle = generateTagsFromDescription(image.title, image.description);
        return config.pool("images")
            .where({
                "name": image.name,
                "path": image.path,
            }).update({
                tags: image.tags,
                title: image.title,
                description: image.description,
                ...tagsFromTitle,
            }).then(() => {
                res.json(image);
            }).catch(next);
    };

    admin.route("/images/errors")
        // Return all errors related to images in database (missing tags, ...)
        .get(async function(req, res, next) {
            res.locals.errorMessage = "Failed to get errors about images in database";
            const missingTags = config.pool({i: "images"})
                .select(config.pool().raw("i.id, i.name, i.path, i.title, i.description, i.\"sizeRatio\", i.create, i.tags"))
                .where({tags: null})
                .orderBy("i.create", "desc");

            const missingTitle = config.pool({i: "images"})
                .select(config.pool().raw("i.id, i.name, i.path, i.title, i.description, i.\"sizeRatio\", i.create, i.tags"))
                .where((builder) => builder.whereNotNull("title").andWhere({description: null}))
                .orWhere((builder) => builder.whereNotNull("description").andWhere({title: null}))
                .orderBy("i.create", "desc");

            const promises = [missingTags, missingTitle];

            Promise.all(promises).then(([imagesWithoutTags, imagesWithoutTitle]) => {
                imagesWithoutTags.forEach((image) => {
                    // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                    image.src = config.convertPathToUrl(image.path + "/" + image.name);
                });
                imagesWithoutTitle.forEach((image) => {
                    // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                    image.src = config.convertPathToUrl(image.path + "/" + image.name);
                });
                const errors = {
                    missingTags: imagesWithoutTags,
                    missingTitle: imagesWithoutTitle,
                };
                res.json(errors);
            }).catch(next);
        });

    admin.route("/images")
        // Process an image from Storage and insert it in database (called from Admin page)
        .post(async function(req, res, next) {
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
        // Update image properties (tags, title, etc)
        .put(async function(req, res, next) {
            const imageToUpdate = req.body;
            res.locals.errorMessage = `Failed to update properties for image ${imageToUpdate.path}/${imageToUpdate.name}.`;
            return updateImageProperties(imageToUpdate, req, res, next);
        })
        // Delete an image
        .delete(async function(req, res, next) {
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
        .patch(async function(req, res, next) {
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

    admin.route("/interiors")
        // Patch an interior = create thumbnails
        .patch(async function(req, res, next) {
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
