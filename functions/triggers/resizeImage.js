const sharp = require("sharp");
const path = require("path");
const {Storage} = require("@google-cloud/storage");
const os = require("os");
const {logger} = require("../utils/logger");

const _sizes = [
    {
        suffix: "s",
        width: 256,
    },
    {
        suffix: "m",
        width: 512,
    },
];

module.exports = function resizeImage(file, fileContent, thumbsFolder) {
    const filePathProps = path.parse(file.name);
    const fileNameWithoutExtension = filePathProps.name;
    const fileExtension = filePathProps.ext;

    const storage = new Storage();
    const bucket = storage.bucket(file.bucket);

    const promises = _sizes.map((sizeSpec) => {
        const resizedFileName = `${fileNameWithoutExtension}_${sizeSpec.suffix}${fileExtension}`;
        const tempResizedFilePath = path.join(os.tmpdir(), resizedFileName);

        const fileDir = filePathProps.dir;
        const resizedFilePathInBucket = `${fileDir}/${thumbsFolder}/${resizedFileName}`;
        return singleResize(fileContent, bucket, sizeSpec.width, tempResizedFilePath, resizedFilePathInBucket);
    });

    return Promise.all(promises);
};

function singleResize(fileContent, bucket, width, tempResizedFilePath, resizedFilePathInBucket) {
    return sharp(fileContent)
        .resize(width, null)
        .toFile(tempResizedFilePath)
        .then(() => {
            return bucket.upload(tempResizedFilePath, {
                destination: resizedFilePathInBucket,
            });
        }).catch((error) => {
            logger.error(`Failed to create resized file ${resizedFilePathInBucket}.`, error);
        });
}
