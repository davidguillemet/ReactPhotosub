const imageSize = require("buffer-image-size");
const path = require("path");

const firebaseStorageUpload = (config) => async (req, res, next) => {
    const files = req.files;
    const bucketName = req.body.bucket;

    if (!files || !bucketName) {
        next(new Error("Missing files or bucket name"));
    }

    const filesInfo = []; // Used to populate information about files (sizeRatio, ...)
    res.locals.filesInfo = filesInfo;
    const savePromises = files.map((file) => {
        const destFileFullPath = path.join(bucketName, file.originalName); // use path library
        const destFile = config.bucket.file(destFileFullPath);
        return destFile.save(file.buffer).then(() => {
            if (file.mimeType.startsWith("image/")) {
                const dimensions = imageSize(file.buffer);
                const sizeRatio = dimensions.width / dimensions.height;
                filesInfo.push({
                    file: file.originalName,
                    sizeRatio: sizeRatio,
                });
                return destFile.setMetadata({
                    metadata: {
                        sizeRatio: sizeRatio,
                    },
                });
            }
        });
    });

    Promise.all(savePromises)
        .then(() => {
            next();
        })
        .catch(next);
};

module.exports = firebaseStorageUpload;
