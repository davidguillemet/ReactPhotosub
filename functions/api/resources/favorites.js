module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/favorites", config.isAuthenticated);

    // Get, Add and Delete favorites
    config.app.route("/favorites")
        // Get all favorites for the current user
        // Since the react query cache is hydrated from userdata response
        // It would be used only in case /userdata failed...
        .get(async function(req, res, next) {
            res.locals.errorMessage = "Le chargement des favoris a échoué.";
            return config.pool({i: "images"})
                .select("i.id", "i.name", "i.path", "i.title", "i.description", "i.sizeRatio", "i.create")
                .join(config.pool().raw(`user_data as u ON u.uid = '${res.locals.uid}' and concat(i.path, '/', i.name) = ANY(u.favorites)`))
                .orderBy("i.create", "desc") // Last image first
                .then((images) => {
                    images.forEach((image) => {
                        // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                        image.src = config.convertPathToUrl(image.path + "/" + image.name);
                    });
                    res.json(images);
                }).catch(next);
        })
        // Add a favorite for a given user
        .post(async function(req, res, next) {
            const favorites = req.body; // Path array
            const queryArray = favorites.map((favorite) => `'${favorite}'`).join(",");
            res.locals.errorMessage = "L'ajout du favori a échoué.";
            return config.pool()
                .raw(`update user_data set favorites = array_cat(favorites, ARRAY[${queryArray}]) where uid = '${res.locals.uid}' returning favorites`)
                .then((result) => {
                    res.json(result.rows[0].favorites);
                }).catch(next);
        })
        // Remove a favorite for a given user
        .delete(async function(req, res, next) {
            const removedFavorite = req.body;
            res.locals.errorMessage = `La suppression de ${removedFavorite.path} de vos favoris a échoué.`;
            return config.pool()
                .raw(`update user_data set favorites = array_remove(favorites, '${removedFavorite.path}') where uid = '${res.locals.uid}' returning favorites`)
                .then((result) => {
                    res.json(result.rows[0].favorites);
                }).catch(next);
        });
};
