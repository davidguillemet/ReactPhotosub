const admin = require("firebase-admin");

module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/userdata", config.isAuthenticated);

    config.app.route("/userdata")
        // Get all data for a given user
        .get(async function(req, res, next) {
            const uid = res.locals.uid;
            const user = await admin.auth().getUser(uid);
            if (user.email === config.settings.admin.email) {
                // Check claims and set admin role if needed
                const user = await admin.auth().getUser(uid);
                const customClaims = user.customClaims;
                if (customClaims === null || customClaims === undefined || customClaims.role !== "admin") {
                    config.logger.info("Set Custom claims for webmaster");
                    await admin.auth().setCustomUserClaims(uid, {roles: ["admin"]});
                }
            }
            // get only admin property and favorites for the current user
            // -> we will fetch simulations on demand
            config.pool().raw(
                `WITH favorites_array as (
                    select ARRAY(
                        select row_to_json(favorite_rows) as favorites
                        from (
                            select i.id, i.name, i.path, i.title, i.description, i."sizeRatio", i.create from images i, user_data u
                            where u.uid = ? and concat(i.path, '/', i.name) = ANY(u.favorites)
                        ) favorite_rows
                    ) favorites
                )
                select f.favorites from user_data u, favorites_array f where uid = ?`, [uid, uid])
                .then(async (dataArray) => {
                    let data = null;
                    if (dataArray.rows === null || dataArray.rows === undefined || dataArray.rows.length === 0) {
                        // No entry for current user yet.
                        // insert an empty one
                        data = {
                            uid: uid,
                            favorites: [], // favorites is an array field that we initialize with an empty array
                            simulations: "[]", // simulations is a jsonb field that we initialize with an empty array
                        };
                        await config.pool("user_data").insert(data);
                    } else {
                        data = dataArray.rows[0];
                        data.favorites.forEach((image) => {
                            // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                            image.src = config.convertPathToUrl(image.path + "/" + image.name);
                        });
                    }
                    return res.json(data);
                }).catch((err) => {
                    config.logger.error(`Failed to load user data for uid ${uid}.`, err);
                    res.status(500)
                        .send(`Unable to load user data for uid ${uid}.`)
                        .end();
                });
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
