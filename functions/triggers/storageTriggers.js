// --trigger-event google.storage.object.finalize
// --trigger-event google.storage.object.delete


// gcloud functions deploy newFile
//          --env-vars-file .env.yaml
//          --runtime nodejs12
//          --trigger-resource photosub.appspot.com
//          --trigger-event google.storage.object.finalize
// gcloud functions deploy deleteFile
//          --env-vars-file .env.yaml
//          --runtime nodejs12
//          --trigger-resource photosub.appspot.com
//          --trigger-event google.storage.object.delete
// gsutil cp DSC_1622.jpg gs://photosub.appspot.com/2014/misool
// file.name = "2014/misool/DSC_1378.jpg" ==> filepath
// file.eventType = "google.storage.object.finalize"

// File API:
// - https://googleapis.dev/nodejs/storage/latest/File.html
// - https://googleapis.dev/nodejs/storage/latest/Bucket.html
// Trigger Sample: https://firebase.google.com/docs/functions/gcp-storage-events

const {Storage} = require("@google-cloud/storage");

const {parse} = require("path");
const axios = require("axios");

const {insertNewImage} = require("./exifProcessing");
const {blurImage, deleteBlurryImage} = require("./blurImage");
const {createThumbnails, deleteThumbnails, addSizeRatio} = require("./resizeImage");
const {apiBaseUrl, logger} = require("./config");

const _blurryFolder = "blurry";
const _thumbsFolder = "thumbs";

exports.deleteFile = function(file) {
    if (isLegacyImage(file) === true) {
        // nothing to do for a legacy image
        return Promise.resolve();
    }

    const promises = [];

    if (mustExtractExif(file)) {
        const fileFullPath = file.name;
        const filePathProps = parse(fileFullPath);
        const fileItemProps = {
            name: filePathProps.base,
            path: filePathProps.dir,
        };
        const promise = axios.delete(apiBaseUrl + "/api/images", {data: fileItemProps});
        promises.push(promise);
    }

    const storage = new Storage();
    const bucket = storage.bucket(file.bucket);

    if (mustBlurImage(file)) {
        promises.push(deleteBlurryImage(bucket, file, _blurryFolder));
    }

    if (mustResizeImage(file)) {
        promises.push(deleteThumbnails(bucket, file, _thumbsFolder));
    }

    if (promises.length > 0) {
        return Promise.all(promises).catch((error) => {
            logger.error(`An error occurred when post-processing the deletion of ${file.name}.`, error);
        });
    }

    return Promise.resolve();
};

exports.newFile = function(file) {
    if (isLegacyImage(file) === true) {
        // nothing to do for a legacy image
        logger.info(`legacy image ${file.name} is not processed.`);
        return Promise.resolve();
    }
    if (mustExtractExif(file) === false &&
        mustResizeImage(file) === false &&
        mustBlurImage(file) === false) {
        // nothing to do for a file tat is not an image or that is an interior image
        logger.info(`${file.name} is not processed.`);
        return Promise.resolve();
    }

    const storage = new Storage();
    const bucket = storage.bucket(file.bucket);
    const fileObject = bucket.file(file.name);

    return fileObject.download().then((data) => {
        return data[0];
    }).then((fileContent) => {
        const promises = [];
        if (mustExtractExif(file)) {
            // Extract exif info and create a new entry in the table "images"
            promises.push(insertNewImage(file, fileContent));
        }
        if (mustBlurImage(file)) {
            // Create a blurry low res version of the new image
            promises.push(blurImage(bucket, file, fileContent, _blurryFolder));
        }
        if (mustResizeImage(file)) {
            // Create thumbnails for the current image
            promises.push(createThumbnails(bucket, file, fileContent, _thumbsFolder));
            if (isInteriorImage(file) || isInHomeSlideshow(file)) {
                // Add sizeRatio property in metadata
                promises.push(addSizeRatio(bucket, file, fileContent));
            }
        }
        return Promise.all(promises);
    }).catch((error) => {
        logger.error(`Failed to download image ${file.name}.`, error);
    });
};

function mustExtractExif(file) {
    // Don't extract exif for interiors, home slideshow and resized images
    return isAnImage(file) === true &&
           isInHomeSlideshow(file) === false &&
           isInteriorImage(file) === false &&
           isResizedImage(file) === false;
}

function mustResizeImage(file) {
    // Resize all images that are not already resized or blurry
    return isAnImage(file) === true &&
           isBlurryImage(file) === false &&
           isResizedImage(file) === false;
}

function mustBlurImage(file) {
    // Blur only the images from home slideshow that are not already blurry
    return isAnImage(file) === true &&
           isInHomeSlideshow(file) === true &&
           isBlurryImage(file) === false &&
           isResizedImage(file) === false;
}

function isAnImage(file) {
    return file.contentType.startsWith("image/");
}

function isLegacyImage(file) {
    return file.name.startsWith("legacy/");
}

function isInHomeSlideshow(file) {
    return file.name.startsWith("homeslideshow/");
}

function isInteriorImage(file) {
    return file.name.startsWith("interiors/") || file.name.startsWith("userUpload/");
}

function isBlurryImage(file) {
    return file.name.includes(_blurryFolder) === true;
}

function isResizedImage(file) {
    return file.name.includes(_thumbsFolder) === true;
}
