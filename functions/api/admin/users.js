const admin = require("firebase-admin");

module.exports = function(adminApp, config) {
    // Pages through all Firebase Auth users — admin.auth().listUsers caps at 1000 per call.
    async function listAllFirebaseUsers() {
        let users = [];
        let pageToken;
        do {
            const result = await admin.auth().listUsers(1000, pageToken);
            users = users.concat(result.users);
            pageToken = result.pageToken;
        } while (pageToken);
        return users;
    }

    adminApp.route("/users")
        .get(async function(req, res, next) {
            res.locals.errorMessage = "La récupération des utilisateurs a échoué.";
            return admin.auth().listUsers(1000)
                .then((listUsersResult) => {
                    res.status(200).send(listUsersResult);
                }).catch(next);
        })
        // Delete one or more orphaned user_data rows — body: {uids: [...]}. Only allowed when
        // none of the uids has a matching Firebase Auth account, to guard against removing a
        // real user's data (e.g. from a stale frontend list). The caller (the admin "Users" tab)
        // already knows which uids are orphaned from GET /users/manage, so this trusts the list
        // modulo the existence re-check below rather than re-deriving it server-side.
        .delete(async function(req, res, next) {
            const {uids} = req.body;
            res.locals.errorMessage = "Failed to delete user_data.";

            if (!Array.isArray(uids) || uids.length === 0) {
                return res.status(400).json({error: "uids (non-empty array) is required"});
            }

            try {
                // admin.auth().getUsers() caps at 100 identifiers per call.
                const stillExisting = [];
                for (let i = 0; i < uids.length; i += 100) {
                    const identifiers = uids.slice(i, i + 100).map((uid) => ({uid}));
                    const {users} = await admin.auth().getUsers(identifiers);
                    stillExisting.push(...users.map((u) => u.uid));
                }
                if (stillExisting.length > 0) {
                    return res.status(400).json({
                        error: "Some uids still have a Firebase account, refusing to delete",
                        uids: stillExisting,
                    });
                }

                // One deleteFiles call per uid (GCS prefixes aren't batchable), run in parallel;
                // a single DB roundtrip removes every row at once.
                await Promise.all(uids.map((uid) => config.bucket.deleteFiles({
                    prefix: `userUpload/${uid}/`,
                    delimiter: "/",
                })));
                await config.pool("user_data").whereIn("uid", uids).delete();

                res.status(200).json({deletedUids: uids});
            } catch (error) {
                next(error);
            }
        });

    // Merged view for the admin "Users" tab: every uid seen in either Firebase Auth or
    // user_data, flagged when the two sources disagree.
    adminApp.route("/users/manage")
        .get(async function(req, res, next) {
            res.locals.errorMessage = "La récupération de la liste des utilisateurs a échoué.";
            return Promise.all([
                listAllFirebaseUsers(),
                config.pool("user_data").select("uid", "favorites", "collections"),
            ]).then(([firebaseUsers, userDataRows]) => {
                const firebaseByUid = new Map(firebaseUsers.map((u) => [u.uid, u]));
                const userDataByUid = new Map(userDataRows.map((row) => [row.uid, row]));
                const allUids = new Set([...firebaseByUid.keys(), ...userDataByUid.keys()]);

                const merged = Array.from(allUids).map((uid) => {
                    const fbUser = firebaseByUid.get(uid);
                    const userDataRow = userDataByUid.get(uid);
                    return {
                        uid,
                        email: fbUser?.email ?? null,
                        displayName: fbUser?.displayName ?? null,
                        disabled: fbUser?.disabled ?? null,
                        hasFirebaseAccount: !!fbUser,
                        hasUserData: !!userDataRow,
                        hasFavorites: userDataRow ?
                            userDataRow.favorites.length > 0 ||
                            Object.values(userDataRow.collections?.items ?? {}).some((item) => item.paths?.length > 0) :
                            null,
                        hasCollections: userDataRow ? Object.keys(userDataRow.collections?.items ?? {}).length > 0 : null,
                    };
                });

                res.status(200).json(merged);
            }).catch(next);
        });
};
