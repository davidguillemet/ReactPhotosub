module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/uploadedInteriors", config.isAuthenticated);

    config.app.route("/uploadedInteriors")
        .get(async function(req, res, next) {
            // Get all uploaded files under the "userUpload/<uid>/interiors" folder in the current bucket
            config.bucket.getFiles({
                prefix: `userUpload/${res.locals.uid}/interiors/`,
                delimiter: "/",
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
            }).catch((err) => {
                config.logger.error("Failed to load user interiors.", err);
                res.status(500)
                    .send("Failed to load user interiors.")
                    .end();
            });
        })
        // Remove an uploaded interior
        .delete(async function(req, res, next) {
            const deleteData = req.body;
            const fileToDelete = deleteData.fileName;
            config.bucket.deleteFiles({
                prefix: `userUpload/${res.locals.uid}/interiors/${fileToDelete}`,
                delimiter: "/",
            }).then((filesResponse) => {
                res.status(200).send(`Successfully deleting image ${fileToDelete}.`).end();
            }).catch((err) => {
                config.logger.error(`Failed to delete the file ${fileToDelete}.`, err);
                res.status(500)
                    .send(`Failed to delete the file ${fileToDelete}.`)
                    .end();
            });
        });
};
