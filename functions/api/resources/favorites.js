module.exports = function(app, config) {
    // Authentication required for the following routes:
    app.use("/favorites", config.isAuthenticated);

    // Get, Add and Delete favorites
    app.route("/favorites/:uid")
        // Get all favorites for the current user
        // Since the react query cache is hydrated from userdata response
        // It would be used only in case /userdata failed...
        .get(async function(req, res, next) {
            // The uid of the user for whom we are requesting the favorites.
            // If it is an admin, it can request favorites for everybody.
            // If not, it can request favorites for himself only
            const requestFavoritesUid = req.params.uid;
            const currentUid = res.locals.uid;
            if (requestFavoritesUid !== currentUid && !config.isAdmin(res)) {
                res.locals.errorMessage = "Un non-admin ne peut pas demander les favoris d'un autre utilisateur.";
                next(new Error(res.locals.errorMessage), req, res);
            }
            res.locals.errorMessage = "Le chargement des favoris a échoué.";
            return config.pool({i: "images"})
                .select("i.id", "i.name", "i.path", "i.title", "i.description", "i.sizeRatio", "i.create", "i.tags")
                .join(config.pool().raw(`user_data as u ON u.uid = '${requestFavoritesUid}' and concat(i.path, '/', i.name) = ANY(u.favorites)`))
                .orderBy("i.create", "desc") // Last image first
                .then((images) => {
                    images.forEach((image) => {
                        // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                        image.src = config.convertPathToUrl(image.path + "/" + image.name);
                    });
                    res.json(images);
                }).catch(next);
        });

    // Get, Add and Delete favorites
    app.route("/favorites")
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
