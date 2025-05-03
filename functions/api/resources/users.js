const admin = require("firebase-admin");

module.exports = function(app, config) {
    app.route("/users/bymail")
        .post(async function(req, res, next) {
            res.locals.errorMessage = "La récupération de l'utilisateur a échoué.";
            return admin.auth().getUserByEmail(req.body.email)
                .then((userRecord) => {
                    res.status(200).send(userRecord.displayName);
                }).catch(() => {
                    // Exception raised if the user does not exist
                    // -> return HTTP 404
                    res.sendStatus(404);
                });
        });

    app.route("/users/create")
        .post(async function(req, res, next) {
            res.locals.errorMessage = "La création de l'utilisateur a échoué.";
            return admin.auth().createUser(req.body)
                .then((userRecord) => {
                    res.status(200).send(userRecord.uid);
                }).catch(next);
        });
};
