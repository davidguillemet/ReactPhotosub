const sharp = require("sharp");
const imageSize = require("buffer-image-size");
const path = require("path");
const {unlink} = require("fs/promises");
const os = require("os");
const {logger} = require("./config");

const ACTION_CREATE = "create";
const ACTION_DELETE = "delete";

/**
 * These sizes are redefined in React app utils.js
 */
const _sizes = [
    {
        suffix: "xs",
        width: 150,
    },
    {
        suffix: "s",
        width: 300,
    },
    {
        suffix: "m",
        width: 600,
    },
    {
        suffix: "l",
        width: 1200,
    },
];

exports.thumbnailSizes = _sizes;

function createThumbnail(fileContent, bucket, width, tempResizedFilePath, resizedFilePathInBucket) {
    const resizeOptions = {
        // No enlargement if the image size is less than specified thumbnail
        withoutEnlargement: true,

        // Used to preserve aspect ratio and resize the image to be as large as possible
        // while ensuring its dimensions are less than or equal to both those specified
        // -> With the same value for width and height, we ensure to resize the longest edge
        //    from this specified value
        fit: "inside",
    };
    return sharp(fileContent)
        .resize(width, width, resizeOptions)
        .toFile(tempResizedFilePath)
        .then(() => {
            return bucket.upload(tempResizedFilePath, {
                destination: resizedFilePathInBucket,
            });
        }).then(() => {
            return unlink(tempResizedFilePath);
        }).catch((error) => {
            logger.error(`Failed to create resized file ${resizedFilePathInBucket}.`, error);
        });
}

function deleteThumbnail(bucket, thumbnailPathInBucket) {
    const bucketFile = bucket.file(thumbnailPathInBucket);
    return bucketFile.exists().then((data) => {
        const exists = data[0];
        if (exists) {
            return bucketFile.delete();
        } else {
            logger.info(`Thumbnail ${thumbnailPathInBucket} does not exist.`);
            return Promise.resolve();
        }
    });
}

function processThumbnails(action, bucket, file, thumbsFolder, actionParams) {
    const filePathProps = path.parse(file.name);
    const fileNameWithoutExtension = filePathProps.name;
    const fileExtension = filePathProps.ext;

    const promises = _sizes.map((sizeSpec) => {
        const thumbnailFileName = `${fileNameWithoutExtension}_${sizeSpec.suffix}${fileExtension}`;

        const fileDir = filePathProps.dir;
        const thumbnailPathInBucket = `${fileDir}/${thumbsFolder}/${thumbnailFileName}`;

        if (action === ACTION_CREATE) {
            const tempResizedFilePath = path.join(os.tmpdir(), thumbnailFileName);
            return createThumbnail(actionParams.fileContent, bucket, sizeSpec.width, tempResizedFilePath, thumbnailPathInBucket);
        } else if (action === ACTION_DELETE) {
            return deleteThumbnail(bucket, thumbnailPathInBucket);
        }
    });

    return Promise.all(promises);
}

exports.createThumbnails = function(bucket, file, fileContent, thumbsFolder) {
    const params = {
        fileContent: fileContent,
    };
    return processThumbnails(ACTION_CREATE, bucket, file, thumbsFolder, params);
};

exports.deleteThumbnails = function(bucket, file, thumbsFolder) {
    return processThumbnails(ACTION_DELETE, bucket, file, thumbsFolder);
};

exports.addSizeRatio = function(bucket, file, filecontent) {
    const dimensions = imageSize(filecontent);

    const bucketFile = bucket.file(file.name);
    return bucketFile.setMetadata({
        metadata: {
            sizeRatio: dimensions.width / dimensions.height,
        },
    });
};
