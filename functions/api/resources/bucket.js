
function resolveAfterDelay(x) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, x);
    });
}

module.exports = function(config) {
    config.app.route("/bucket/:folder")
        .get(async function(req, res, next) {
            // Get images from a bucket folder
            await resolveAfterDelay(3000);

            config.bucket.getFiles({
                prefix: `${req.params.folder}/`,
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
                config.logger.error(`Failed to load images from ${req.params.folder}`, err);
                res.status(500)
                    .send(`Failed to load images from ${req.params.folder}`)
                    .end();
            });
        });
};
