module.exports = function(app, config) {
    app.use("/collections", config.isAuthenticated);

    // Admin: get collections for any user
    app.route("/collections/:uid")
        .get(async function(req, res, next) {
            const requestedUid = req.params.uid;
            if (requestedUid !== res.locals.uid && !config.isAdmin(res)) {
                res.locals.errorMessage = "Un non-admin ne peut pas accéder aux collections d'un autre utilisateur.";
                return next(new Error(res.locals.errorMessage));
            }
            res.locals.errorMessage = "Le chargement des collections a échoué.";
            return config.pool("user_data")
                .select("collections")
                .where({uid: requestedUid})
                .first()
                .then((row) => res.json(row ? row.collections : {active: "main", items: {}}))
                .catch(next);
        });

    app.route("/collections")
        // Return the full collections jsonb for the current user
        .get(async function(req, res, next) {
            const uid = res.locals.uid;
            res.locals.errorMessage = "Le chargement des collections a échoué.";
            return config.pool("user_data")
                .select("collections")
                .where({uid})
                .first()
                .then((row) => res.json(row ? row.collections : {active: "main", items: {}}))
                .catch(next);
        })
        // Create a new collection — body: {name_fr, name_en}
        .post(async function(req, res, next) {
            /* eslint-disable camelcase */
            const {name_fr, name_en} = req.body;
            const uid = res.locals.uid;
            res.locals.errorMessage = "La création de la collection a échoué.";

            if (!name_fr || !name_en) {
                return res.status(400).json({error: "name_fr and name_en are required"});
            }

            return config.pool("user_data")
                .select("collections")
                .where({uid})
                .first()
                .then((row) => {
                    const collections = row ? row.collections : {active: "main", items: {}};
                    const items = collections.items || {};

                    const isDuplicate = Object.values(items).some(
                        (item) => item.name_fr === name_fr || item.name_en === name_en,
                    );
                    if (isDuplicate) {
                        return res.status(409).json({error: "A collection with this name already exists"});
                    }

                    const id = `c_${Date.now()}`;
                    const newItem = {name_fr, name_en, paths: []};
                    /* eslint-enable camelcase */

                    return config.pool()
                        .raw(
                            `UPDATE user_data
                             SET collections = jsonb_set(collections, ARRAY['items', ?], ?::jsonb)
                             WHERE uid = ?
                             RETURNING collections`,
                            [id, JSON.stringify(newItem), uid],
                        )
                        .then((result) => res.json(result.rows[0].collections));
                })
                .catch(next);
        })
        // Rename a collection — body: {id, name_fr, name_en}
        .patch(async function(req, res, next) {
            /* eslint-disable camelcase */
            const {id, name_fr, name_en} = req.body;
            /* eslint-enable camelcase */
            const uid = res.locals.uid;
            res.locals.errorMessage = "Le renommage de la collection a échoué.";

            if (!id || id === "main") {
                return res.status(400).json({error: "Cannot rename the main collection"});
            }
            /* eslint-disable camelcase */
            if (!name_fr || !name_en) {
                return res.status(400).json({error: "name_fr and name_en are required"});
            }

            return config.pool()
                .raw(
                    `UPDATE user_data
                     SET collections = jsonb_set(
                         jsonb_set(collections, ARRAY['items', ?, 'name_fr'], to_jsonb(?::text)),
                         ARRAY['items', ?, 'name_en'], to_jsonb(?::text)
                     )
                     WHERE uid = ?
                     RETURNING collections`,
                    [id, name_fr, id, name_en, uid],
                )
                /* eslint-enable camelcase */
                .then((result) => res.json(result.rows[0].collections))
                .catch(next);
        })
        // Delete a collection — body: {id}
        .delete(async function(req, res, next) {
            const {id} = req.body;
            const uid = res.locals.uid;
            res.locals.errorMessage = "La suppression de la collection a échoué.";

            if (!id || id === "main") {
                return res.status(400).json({error: "Cannot delete the main collection"});
            }

            return config.pool()
                .raw(
                    `UPDATE user_data
                     SET collections = CASE
                         WHEN collections->>'active' = ?
                         THEN jsonb_set(collections #- ARRAY['items', ?], '{active}', '"main"')
                         ELSE collections #- ARRAY['items', ?]
                     END
                     WHERE uid = ?
                     RETURNING collections`,
                    [id, id, id, uid],
                )
                .then((result) => res.json(result.rows[0].collections))
                .catch(next);
        });

    // Set the active collection
    app.route("/collections/active")
        .patch(async function(req, res, next) {
            const {active} = req.body;
            const uid = res.locals.uid;
            res.locals.errorMessage = "La mise à jour de la collection active a échoué.";

            if (!active) {
                return res.status(400).json({error: "active is required"});
            }

            return config.pool("user_data")
                .select("collections")
                .where({uid})
                .first()
                .then((row) => {
                    const collections = row ? row.collections : {active: "main", items: {}};
                    if (active !== "main" && !collections.items?.[active]) {
                        return res.status(404).json({error: "Collection not found"});
                    }

                    return config.pool()
                        .raw(
                            `UPDATE user_data
                             SET collections = jsonb_set(collections, '{active}', ?::jsonb)
                             WHERE uid = ?
                             RETURNING collections`,
                            [JSON.stringify(active), uid],
                        )
                        .then((result) => res.json(result.rows[0].collections));
                })
                .catch(next);
        });
};
