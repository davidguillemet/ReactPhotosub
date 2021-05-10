const sharp = require("sharp");
const path = require("path");
const {Storage} = require("@google-cloud/storage");
const os = require("os");
const {logger} = require("../utils/logger");
const functions = require("firebase-functions");
const configFunctions = functions.config();

module.exports = function blurImage(file, fileContent, blurryFolder) {
    const filePathProps = path.parse(file.name);
    const fileName = filePathProps.base;
    const fileNameWithoutExtension = filePathProps.name;
    const fileExtension = filePathProps.ext;
    const tempBlurryFileName = `${fileNameWithoutExtension}_blurry${fileExtension}`;
    const tempBlurryFilePath = path.join(os.tmpdir(), tempBlurryFileName);

    return sharp(fileContent)
        .blur(parseFloat(configFunctions.blur.sigma))
        .toFile(tempBlurryFilePath)
        .then(() => {
            const fileDir = filePathProps.dir;
            const blurryFilePathInBucket = `${fileDir}/${blurryFolder}/${fileName}`;

            const storage = new Storage();
            const bucket = storage.bucket(file.bucket);
            return bucket.upload(tempBlurryFilePath, {
                destination: blurryFilePathInBucket,
            });
        }).catch((error) => {
            logger.error(`Failed to create blurry version of ${file.name}.`, error);
        });
};
