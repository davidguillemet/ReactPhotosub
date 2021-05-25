module.exports = function(config) {
    config.app.route("/userdata/:uid")
        // Get all data for a given user
        .get(async function(req, res, next) {
            try {
                // get only favorite identifiers for the current user
                // -> we will fetch simulations on demand
                const dataArray = await config.pool("user_data").select("favorites").where("uid", req.params.uid);
                let data = null;
                if (dataArray.length === 0) {
                    // No entry for current user yet.
                    // insert an empty one
                    data = {
                        uid: req.params.uid,
                        favorites: [], // favorites is an array field that we initialize with an empty array
                        simulations: "[]", // simulations is a jsonb field that we initialize with an empty array
                    };
                    await config.pool("user_data").insert(data);
                } else {
                    data = dataArray[0];
                }
                res.json(data);
            } catch (err) {
                config.logger.error(`Failed to load user data for uid ${req.params.uid}.`, err);
                res.status(500)
                    .send(`Unable to load user data for uid ${req.params.uid}.`)
                    .end();
            }
        });

    config.app.route("/userdata")
        .delete(async function(req, res, next) {
        // {
        //     uid: "xxxxxxxxxx",
        //     displayName: "cccccccc"
        // }
            const userInfo = req.body;
            try {
                await config.pool("user_data").where({
                    uid: userInfo.uid,
                }).delete();
                res.status(200).send(`Successfully deleting data for user ${userInfo.displayName}.`).end();
            } catch (err) {
                config.logger.error(`Failed to remove data for user ${userInfo.displayName}.`, err);
                res.status(500).send(`Error while deleting data for user ${userInfo.displayName}.`).end();
            }
        });
};
