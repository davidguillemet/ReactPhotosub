const admin = require("firebase-admin");

module.exports = function(app, config) {
    app.use("/user", config.isAuthenticated);

    app.route("/user")
        // Update the specified user information
        .put(async function(req, res, next) {
            const newUserProperties = req.body;
            const uid = res.locals.uid;
            res.locals.errorMessage = "La mise à jour des informations a échoué.";
            return admin.auth().updateUser(uid, newUserProperties)
                .then((userRecord) => {
                    res.status(200).send({user: userRecord});
                }).catch((error) => {
                    res.status(500).send({error});
                });
        });
};
