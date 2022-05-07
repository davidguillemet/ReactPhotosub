const admin = require("firebase-admin");

module.exports = function(config) {
    config.app.use("/user", config.isAuthenticated);

    config.app.route("/user")
        // Update the specified user information
        .put(async function(req, res, next) {
            const newUserProperties = req.body;
            const uid = res.locals.uid;
            return admin.auth().updateUser(uid, newUserProperties)
                .then((userRecord) => {
                    res.status(200).send({user: userRecord});
                }).catch((err) => {
                    config.logger.error(`Failed to update user ${uid} .`, err);
                    res.status(500).send({error: err}).end();
                });
        });
};
