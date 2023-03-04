module.exports = function(app, config) {
    // Authentication required for the following routes:
    app.use("/uploadedInteriors", config.isAuthenticated);

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

    app.route("/bucket/:folder")
        // Get bucket content
        .get(async function(req, res, next) {
            return getBucketContent(req.params.folder, req, res, next);
        });

    app.route("/uploadedInteriors")
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
};
