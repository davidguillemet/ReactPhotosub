module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/favorites", config.isAuthenticated);

    // Get, Add and Delete favorites
    config.app.route("/favorites")
        // Get all favorites for the current user
        .get(async function(req, res, next) {
            try {
                const images = await config.pool({i: "images"})
                    .select("i.id", "i.name", "i.path", "i.title", "i.description", "i.sizeRatio", "i.create")
                    .join(config.pool().raw(`user_data as u ON u.uid = '${res.locals.uid}' and concat(i.path, '/', i.name) = ANY(u.favorites)`))
                    .orderBy("i.create", "desc"); // Last image first

                images.forEach((image) => {
                    // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                    image.src = config.convertPathToUrl(image.path + "/" + image.name);
                });
                res.json(images);
            } catch (err) {
                config.logger.error(`Failed to get favorites for user ${res.locals.uid}.`, err);
                res.status(500).send(`Failed to get favorites for user ${res.locals.uid}.`).end();
            }
        })
        // Add a favorite for a given user
        .post(async function(req, res, next) {
            const favorites = req.body; // Path array
            try {
                const queryArray = favorites.map((favorite) => `'${favorite}'`).join(",");
                const result = await config.pool()
                    .raw(`update user_data set favorites = array_cat(favorites, ARRAY[${queryArray}]) where uid = '${res.locals.uid}' returning favorites`);
                res.json(result.rows[0].favorites);
            } catch (err) {
                config.logger.error(`Failed to add favorites for user ${res.locals.uid}.`, err);
                res.status(500).send(`Failed to add favorites for user ${res.locals.uid}.`).end();
            }
        })
        // Remove a favorite for a given user
        .delete(async function(req, res, next) {
            const removedFavorite = req.body;
            try {
                const result = await config.pool()
                    .raw(`update user_data set favorites = array_remove(favorites, '${removedFavorite.path}') where uid = '${res.locals.uid}' returning favorites`);
                res.json(result.rows[0].favorites);
            } catch (err) {
                config.logger.error(`Failed to remove ${removedFavorite.path} in favorites for user ${res.locals.uid}.`, err);
                res.status(500).send(`Failed to remove ${removedFavorite.path} in favorites for user ${res.locals.uid}.`).end();
            }
        });
};
