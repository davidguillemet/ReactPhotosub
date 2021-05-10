const exifr = require("exifr");
const imageSize = require("buffer-image-size");
const axios = require("axios");
const {parse} = require("path");
const {logger} = require("../utils/logger");

// TODO read this base url from configuration or any other settings...
const _baseApiUrl = "https://photosub.web.app";

module.exports = async function extractExif(file, fileContent) {
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

