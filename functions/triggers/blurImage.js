const sharp = require("sharp");
const path = require("path");
const os = require("os");
const {logger} = require("./config");

function _getBlurryFilePath(filePathProps, blurryFolder) {
    const fileDir = filePathProps.dir;
    const fileName = filePathProps.base;
    const blurryFilePathInBucket = `${fileDir}/${blurryFolder}/${fileName}`;
    return blurryFilePathInBucket;
}

exports.blurImage = function(bucket, file, fileContent, blurryFolder) {
    const filePathProps = path.parse(file.name);
    const fileNameWithoutExtension = filePathProps.name;
    const fileExtension = filePathProps.ext;
    const tempBlurryFileName = `${fileNameWithoutExtension}_blurry${fileExtension}`;
    const tempBlurryFilePath = path.join(os.tmpdir(), tempBlurryFileName);

    return sharp(fileContent)
        .blur(parseFloat(process.env.BLUR_SIGMA))
        .toFile(tempBlurryFilePath)
        .then(() => {
            const blurryFilePathInBucket = _getBlurryFilePath(filePathProps, blurryFolder);

            return bucket.upload(tempBlurryFilePath, {
                destination: blurryFilePathInBucket,
            });
        }).catch((error) => {
            logger.error(`Failed to create blurry version of ${file.name}.`, error);
        });
};

exports.deleteBlurryImage = function(bucket, file, blurryFolder) {
    const filePathProps = path.parse(file.name);
    const blurryFilePathInBucket = _getBlurryFilePath(filePathProps, blurryFolder);

    const bucketFile = bucket.file(blurryFilePathInBucket);
    return bucketFile.exists().then((data) => {
        const exists = data[0];
        if (exists) {
            return bucketFile.delete();
        } else {
            logger.info(`Blurry image ${blurryFilePathInBucket} does not exist.`);
            return Promise.resolve();
        }
    });
};
