module.exports = function(app, config) {
    // Authentication required for the following routes:
    app.use("/favorites", config.isAuthenticated);

    // Get favorites for a user, optionally filtered by collection
    app.route("/favorites/:uid")
        .get(async function(req, res, next) {
            const requestFavoritesUid = req.params.uid;
            const currentUid = res.locals.uid;
            if (requestFavoritesUid !== currentUid && !config.isAdmin(res)) {
                res.locals.errorMessage = "Un non-admin ne peut pas demander les favoris d'un autre utilisateur.";
                return next(new Error(res.locals.errorMessage));
            }

            const collectionId = req.query.collection || "main";
            res.locals.errorMessage = "Le chargement des favoris a échoué.";

            let query;
            if (collectionId === "main") {
                query = config.pool({i: "images"})
                    .select("i.id", "i.name", "i.path", "i.title", "i.description", "i.sizeRatio", "i.create", "i.tags", "i.version")
                    .join(
                        config.pool().raw(
                            "user_data as u ON u.uid = ? and concat(i.path, '/', i.name) = ANY(u.favorites)",
                            [requestFavoritesUid],
                        ),
                    )
                    .orderBy("i.create", "desc");
            } else {
                query = config.pool({i: "images"})
                    .select("i.id", "i.name", "i.path", "i.title", "i.description", "i.sizeRatio", "i.create", "i.tags", "i.version")
                    .join(
                        config.pool().raw(
                            "user_data as u ON u.uid = ? and concat(i.path, '/', i.name) IN (select jsonb_array_elements_text(u.collections->'items'->?->'paths'))",
                            [requestFavoritesUid, collectionId],
                        ),
                    )
                    .orderBy("i.create", "desc");
            }

            return query.then((images) => {
                images.forEach((image) => {
                    image.src = config.convertPathToUrl(image.path + "/" + image.name);
                });
                res.json(images);
            }).catch(next);
        });

    app.route("/favorites")
        // Add a favorite — body: {paths: [...], collection: "main"|"c_<id>"}
        .post(async function(req, res, next) {
            const {paths, collection = "main"} = req.body;
            const uid = res.locals.uid;
            res.locals.errorMessage = "L'ajout du favori a échoué.";

            if (collection === "main") {
                return config.pool()
                    .raw(
                        "UPDATE user_data SET favorites = array_cat(favorites, ?) WHERE uid = ? RETURNING favorites",
                        [paths, uid],
                    )
                    .then((result) => res.json(result.rows[0].favorites))
                    .catch(next);
            } else {
                return config.pool()
                    .raw(
                        `UPDATE user_data
                         SET collections = jsonb_set(
                             collections,
                             ARRAY['items', ?, 'paths'],
                             (collections->'items'->?->'paths') || to_jsonb(?::text[])
                         )
                         WHERE uid = ?
                         RETURNING collections`,
                        [collection, collection, paths, uid],
                    )
                    .then((result) => res.json(result.rows[0].collections))
                    .catch(next);
            }
        })
        // Remove a favorite — body: {path: "...", collection: "main"|"c_<id>"}
        .delete(async function(req, res, next) {
            const {path, collection = "main"} = req.body;
            const uid = res.locals.uid;
            res.locals.errorMessage = `La suppression de ${path} de vos favoris a échoué.`;

            if (collection === "main") {
                return config.pool()
                    .raw(
                        "UPDATE user_data SET favorites = array_remove(favorites, ?) WHERE uid = ? RETURNING favorites",
                        [path, uid],
                    )
                    .then((result) => res.json(result.rows[0].favorites))
                    .catch(next);
            } else {
                return config.pool()
                    .raw(
                        `UPDATE user_data
                         SET collections = jsonb_set(
                             collections,
                             ARRAY['items', ?, 'paths'],
                             (
                                 SELECT jsonb_agg(p)
                                 FROM jsonb_array_elements_text(collections->'items'->?->'paths') AS p
                                 WHERE p <> ?
                             )
                         )
                         WHERE uid = ?
                         RETURNING collections`,
                        [collection, collection, path, uid],
                    )
                    .then((result) => res.json(result.rows[0].collections))
                    .catch(next);
            }
        });
};
