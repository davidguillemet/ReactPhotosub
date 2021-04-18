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

// File API: https://googleapis.dev/nodejs/storage/latest/File.html
// Trigger Sample: https://firebase.google.com/docs/functions/gcp-storage-events

const {Storage} = require("@google-cloud/storage");

const {parse} = require("path");
const axios = require("axios");
const exifr = require("exifr");
const imageSize = require("buffer-image-size");

const {logger} = require("../utils/logger");

const _baseApiUrl = "https://photosub.web.app";

exports.deleteFile = async function(file) {
    if (ignoreFile(file)) {
        return;
    }
    const fileFullPath = file.name;
    const filePathProps = parse(fileFullPath);
    const fileItemProps = {
        name: filePathProps.base,
        path: filePathProps.dir,
    };
    try {
        await axios.delete(_baseApiUrl + "/api/image", {data: fileItemProps});
        logger.info(`${fileFullPath} has been removed.`);
    } catch (error) {
        logger.error(`Failed to delete image ${fileFullPath}.`, error);
    }
};

exports.newFile = async function(file) {
    if (ignoreFile(file)) {
        return;
    }

    const storage = new Storage();
    const bucket = storage.bucket(file.bucket);
    const fileObject = bucket.file(file.name);
    let fileContent = null;
    try {
        const data = await fileObject.download();
        fileContent = data[0];
    } catch (error) {
        logger.error(`Failed to download image ${file.name}.`, error);
        return;
    }

    let xmp = null;

    try {
        xmp = await exifr.parse(fileContent, {
            xmp: true,
            tiff: false,
            ifd0: false,
            gps: false,
            exif: false,
        });
    } catch (error) {
        logger.error(`Failed to extract exif from ${file.name}.`, error);
        return;
    }

    if (xmp === null || xmp === undefined) {
        logger.error(`Exif information for ${file.name} is undefined.`);
        return;
    }

    // Update the intial gallery image
    const imageTitle = getObjectProperty(xmp.title, "value", "");
    const imageDescription = getObjectProperty(xmp.description, "value", "");
    const imageTags = getObjectProperty(xmp, "subject", null);

    let imageCaption = null;
    let captionTags = null;

    const captionSingleTerms = [];
    const captionComposedTerms = [];
    analyzeDescription(imageTitle, captionSingleTerms, captionComposedTerms);
    analyzeDescription(imageDescription, captionSingleTerms, captionComposedTerms);
    if (captionSingleTerms.length > 0 && captionComposedTerms.length > 0) {
        // Create the caption string by keeping duplicates to keep term order untouched
        imageCaption = " " + captionComposedTerms.join(" ") + " ";
        // remove duplicates for tags array using a Set
        const singleAndComposedTerms = captionSingleTerms.concat(captionComposedTerms);
        const tagSet = new Set(singleAndComposedTerms);
        captionTags = Array.from(tagSet);
    }

    // Get image size:
    const dimensions = imageSize(fileContent);

    const filePathProps = parse(file.name);

    const newImageItem = {
        name: filePathProps.base,
        path: filePathProps.dir,
        title: imageTitle,
        description: imageDescription,
        tags: imageTags,
        caption: imageCaption,
        captionTags: captionTags,
        width: dimensions.width,
        height: dimensions.height,
        sizeRatio: dimensions.width / dimensions.height,
    };

    logger.info(`Successfuly build image details for ${file.name} in Finalize GCS trigger.`, newImageItem);

    // Send post request api-photosub/image to insert a new image item
    try {
        await axios.post(_baseApiUrl + "/api/image", newImageItem);
        logger.info(`${file.name} has been inserted.`);
    } catch (error) {
        logger.error(`Failed to insert new image ${file.name}.`, error);
    }
};

function getObjectProperty(object, propertyName, defaultValue) {
    if (object !== null && object !== undefined) {
        const propertyValue = object[propertyName];
        if (propertyValue !== undefined) {
            return propertyValue;
        }
    }
    return defaultValue;
}

function analyzeDescription(inputString, captionSingleTerms, captionComposedTerms) {
    if (inputString === null || inputString === undefined || inputString.length === 0) {
        return;
    }

    // InputString = "Carangue vorace, Carangue à gros yeux (Caranx sexfasciatus), Carangue balo (Carangoides gymnostethus)"
    // => to extract "Carangue", "vorace", "Carangue", gros", "yeux", "Caranx", "sexfasciatus", "Carangue", "balo", "Carangoides", "gymnostethus"
    // => each term must contain at least 3 characters
    const singleTermsExtractionRegex = new RegExp("[ (,']*([^ (),']{3,})[ ),']*", "g");

    // => to extract "Carangue vorace", "Carangue à gros yeux", "Caranx sexfasciatus", "Carangue balo", "Carangoides gymnostethus"
    const compositeTermsExtractionRegex = new RegExp("([^,()]+)", "g");

    extractGroups(inputString, captionSingleTerms, singleTermsExtractionRegex);
    extractGroups(inputString, captionComposedTerms, compositeTermsExtractionRegex);
}

function extractGroups(inputString, tags, regex) {
    let match = null;
    while ((match = regex.exec(inputString)) !== null) {
        tags.push(match[1].trim().toLowerCase());
    }
}

function ignoreFile(file) {
    const contentType = file.contentType; // File content type
    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith("image/")) {
        logger.info(`${file.name} is not an image.`);
        return true;
    }

    // Does not process images from homeslideshow
    if (file.name.startsWith("homeslideshow")) {
        logger.info(`Home slideshow image ${file.name} is not processed.`);
        return true;
    }

    // Does not process interior images
    if (file.name.startsWith("interiors")) {
        logger.info(`Interior image ${file.name} is not processed.`);
        return true;
    }

    return false;
}
