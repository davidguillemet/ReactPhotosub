const admin = require("firebase-admin");

module.exports = function(adminApp, config) {
    adminApp.route("/users")
        .get(async function(req, res, next) {
            res.locals.errorMessage = "La récupération des utilisateurs a échoué.";
            return admin.auth().listUsers(1000)
                .then((listUsersResult) => {
                    res.status(200).send(listUsersResult);
                }).catch(next);
        });
};
