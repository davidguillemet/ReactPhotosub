module.exports = function(admin, config) {
    admin.route("/bucket")
        // Delete a Storage item
        .delete(async function(req, res, next) {
            const deleteData = req.body;
            const folderToDelete = deleteData.path;
            res.locals.errorMessage = `La suppression du répertoire '${folderToDelete}' a échoué.`;
            return config.bucket.deleteFiles({
                prefix: folderToDelete,
            }).then((filesResponse) => {
                res.status(200).send(`Successfully deleted folder ${folderToDelete}.`).end();
            }).catch(next);
        });

    admin.route("/bucket/*")
        // Rename a folder
        .patch(async function(req, res, next) {
            const folder = req.params[0];
            const file = config.bucket.file(folder);
            const newProps = req.body;
            res.locals.errorMessage = `Le renommage du répertoire '${folder}' a échoué.`;
            return file.rename(newProps.name)
                .then((response) => {
                    res.status(200).send(`Successfully rename '${folder}' as '${newProps.name}.`).end();
                }).catch(next);
        });
};
