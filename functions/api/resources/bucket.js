const path = require("path");
const multiPartFormData = require("../middlewares/multiPartFormData");
const firebaseStorageUpload = require("../middlewares/firebaseStorageUpload");

module.exports = function(app, config) {
    // Authentication required for the following routes:
    app.use("/uploadedInteriors", config.isAuthenticated);

    const getBucketContent = (folder, req, res, next) => {
        return Promise.resolve().then(() => {
            // Get images from a bucket folder
            // Bucket folder is:
            // - interiors
            // - homeslideshow | home (imageKit)
            // - userUpload/<uid>/interiors
            if (folder === "interiors") {
                res.locals.errorMessage = "Le chargement des images d'ambiance a échoué.";
            } else if (folder === "homeslideshow" || folder === "home") {
                res.locals.errorMessage = "Le chargement de la présélection d'images a échoué.";
            } else if (folder.startsWith("userUpload/")) {
                res.locals.errorMessage = "Le chargement de vos images d'ambiance a échoué.";
            } else {
                res.locals.errorMessage = `Le répertoire '${folder}' est invalide.`;
                throw new Error(res.locals.errorMessage);
            }
        }).then(() => {
            return config.bucket.getFiles({
                prefix: `${folder}/`,
                delimiter: "/",
            });
        }).then((filesResponse) => {
            const [files] = filesResponse;
            res.json(files
                .filter((file) => file.metadata.contentType.startsWith("image/"))
                .map((file) => {
                    return {
                        src: file.publicUrl(),
                        sizeRatio: file.metadata.metadata.sizeRatio,
                    };
                }));
        }).catch(next);
    };

    app.route("/bucket/:folder")
        // Get bucket content
        .get(async function(req, res, next) {
            return getBucketContent(req.params.folder, req, res, next);
        });

    app.route("/uploadedInteriors")
        .get(async function(req, res, next) {
            // Get all uploaded files under the "userUpload/<uid>/interiors" folder in the current bucket
            return getBucketContent(`userUpload/${res.locals.uid}/interiors`, req, res, next);
        })
        // Remove an uploaded interior
        .delete(async function(req, res, next) {
            const deleteData = req.body;
            const fileToDelete = deleteData.fileName;
            res.locals.errorMessage = "La suppression de l'image a échoué.";
            const userFolder = `userUpload/${res.locals.uid}/interiors`;
            const promises = [];
            // Remove original file
            promises.push(config.bucket.deleteFiles({
                prefix: `${userFolder}/${fileToDelete}`,
                delimiter: "/",
            }));
            // Remove all thumbnails = prefix as file name without extension in thumbs folder
            const filePathProps = path.parse(fileToDelete);
            promises.push(config.bucket.deleteFiles({
                prefix: `${userFolder}/thumbs/${filePathProps.name}`,
                delimiter: "/",
            }));
            return Promise.all(promises)
                .then((/* filesResponses */) => {
                    res.status(200).send(`Successfully deleting image ${fileToDelete}.`).end();
                }).catch(next);
        });

    function checkBucketAccess(request, response, next) {
        const bucket = request.body.bucket;
        // By default, only the admin can upload files
        // but a registered user can upload interiors in `userUpload/${user.uid}/interiors`
        // - Here, we know a user is registered and response.locals.uid is populated
        const userSpecificFolder = `userUpload/${response.locals.uid}/`; // interiors or other
        const userBucket = bucket.startsWith(userSpecificFolder);
        if (userBucket || config.isAdmin(response)) {
            next();
        } else {
            response.locals.errorMessage = "Unauthorized target bucket.";
            next(new Error("Unauthorized target bucket."));
        }
    }

    app.post(
        "/bucket/file",
        config.isAuthenticated, // only a register user can upload files
        multiPartFormData(config), // Read multipart form data = files and fields as body properties
        checkBucketAccess, // Once the target bucket is known, check its access (registered user or admin only)
        firebaseStorageUpload(config), // Save uploaded files in firebase storage
        async function(req, res, next) {
            res.status(200).send(res.locals.filesInfo).end();
        },
    );
};
