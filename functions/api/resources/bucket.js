const {thumbnailSizes} = require("../../triggers/resizeImage");
const path = require("path");

module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/thumbstatus", config.isAuthenticated);
    config.app.use("/uploadedInteriors", config.isAuthenticated);

    const getBucketContent = (folder, req, res, next) => {
        return Promise.resolve().then(() => {
            // Get images from a bucket folder
            // Bucket folder is:
            // - interiors
            // - homeslideshow
            // - userUpload/<uid>/interiors
            if (folder === "interiors") {
                res.locals.errorMessage = "Le chargement des images d'ambiance a échoué.";
            } else if (folder == "homeslideshow") {
                res.locals.errorMessage = "Le chargement de la présélection d'images a échoué.";
            } else if (folder.startsWith("userUpload/")) {
                res.locals.errorMessage = "Le chargement de vos images d'ambiance a échoué.";
            } else {
                res.locals.errorMessage = `Le répertoire '${folder}' est invalide.`;
                throw new Error(res.locals.errorMessage);
            }
        }).then(() => {
            return config.bucket.getFiles({
                prefix: `${folder}/`,
                delimiter: "/",
            });
        }).then((filesResponse) => {
            const [files] = filesResponse;
            res.json(files
                .filter((file) => file.metadata.contentType.startsWith("image/"))
                .map((file) => {
                    return {
                        src: file.publicUrl(),
                        sizeRatio: file.metadata.metadata.sizeRatio,
                    };
                }));
        }).catch(next);
    };

    config.app.route("/bucket/:folder")
        // Get bucket content
        .get(async function(req, res, next) {
            return getBucketContent(req.params.folder, req, res, next);
        });

    config.app.route("/bucket/*")
        .patch(
            config.isAuthenticated, // Authentication required to rename a folder
            config.isAuthorized(["admin"]), // ONly the admin is authorized to rename a folder
            async function(req, res, next) {
                const folder = req.params[0];
                const file = config.bucket.file(folder);
                const newProps = req.body;
                res.locals.errorMessage = `Le renommage du répertoire '${folder}' a échoué.`;
                return file.rename(newProps.name)
                    .then((response) => {
                        res.status(200).send(`Successfully rename '${folder}' as '${newProps.name}.`).end();
                    }).catch(next);
            });

    config.app.route("/uploadedInteriors")
        .get(async function(req, res, next) {
            // Get all uploaded files under the "userUpload/<uid>/interiors" folder in the current bucket
            return getBucketContent(`userUpload/${res.locals.uid}/interiors`, req, res, next);
        })
        // Remove an uploaded interior
        .delete(async function(req, res, next) {
            const deleteData = req.body;
            const fileToDelete = deleteData.fileName;
            res.locals.errorMessage = "La suppression de l'image a échoué.";
            return config.bucket.deleteFiles({
                prefix: `userUpload/${res.locals.uid}/interiors/${fileToDelete}`,
                delimiter: "/",
            }).then((filesResponse) => {
                res.status(200).send(`Successfully deleting image ${fileToDelete}.`).end();
            }).catch(next);
        });

    // Check the status of the thumbnails for a specific file
    config.app.route("/thumbstatus/:filename")
        .get(async function(req, res, next) {
            const fileName = req.params.filename;
            const fileProps = path.parse(fileName);
            const thumbsToGenerate = [...thumbnailSizes];
            const thumbNamePrefix = `userUpload/${res.locals.uid}/interiors/thumbs/${fileProps.name}`;

            while (thumbsToGenerate.length > 0) {
                const promises = thumbsToGenerate.map((thumb) => {
                    const thumbName = `${thumbNamePrefix}_${thumb.suffix}${fileProps.ext}`;
                    const file = config.bucket.file(thumbName);
                    return file.exists();
                });
                await Promise.all(promises).then((results) => {
                    for (let i = results.length - 1; i >= 0; i--) {
                        if (results[i][0] === true) {
                            thumbsToGenerate.splice(i, 1);
                        }
                    }
                });
            }

            res.locals.errorMessage = "La vérification de la génération des vignettes a échoué...";
            // Get the metadata for the initial file that should contain the size ratio
            return Promise.resolve().then(() => {
                const initialUploadedFile = config.bucket.file(`userUpload/${res.locals.uid}/interiors/${fileProps.base}`);
                return initialUploadedFile;
            }).then((initialUploadedFile) => {
                return initialUploadedFile.getMetadata();
            }).then((data) => {
                const metadata = data[0];
                res.json(metadata.metadata);
            }).catch(next);
        });
};
