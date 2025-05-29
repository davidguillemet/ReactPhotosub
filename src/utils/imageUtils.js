import { parseSingleDescription } from './utils';

// For sharp and imageKit
// -> don't rename
const THUMB_XS = 150;
const THUMB_S  = 300;
const THUMB_M = 600;
const THUMB_L = 1200;

// For imageKit only
const THUMB_XL = 1500;
const THUMB_XXL = 2000;
// Any thumb size greater than 2000 will fall into this category,
// but anyway, a limitation has been configured in imageKit settings:
// - desktop: 2560 max whatever the transformation specification is
//   -> 2560 is also the new size of the longest edge of any image that is exported from lightroom
// - mobile : 1000 max whatever the transformation specification is
const THUMB_MAX = 100000; // to catch any size greater than THUMB_XXL

export const useImageKit = process.env.REACT_APP_IMAGEKIT === "true";

export const HOME_IMAGE_FOLDER = useImageKit ? "home" : "homeslideshow";

const _thumbsSubFolder = 'thumbs';

const _imageKitAdditionalThumbs = [
    {
        maxSize: THUMB_XL,
        propertyName: "xl",
        fileSuffix: "xl",
        caption: "xl"
    },
    {
        maxSize: THUMB_XXL,
        propertyName: "xxl",
        fileSuffix: "xxl",
        caption: "xxl"
    },
    {
        maxSize: THUMB_MAX,
        propertyName: "max",
        fileSuffix: "max",
        caption: "max"
    }
];

export const _thumbnailSpecs = [
    {
        maxSize: THUMB_XS,
        propertyName: "extraSmallSrc",
        fileSuffix: "xs",
        caption: "extra small",
    },
    {
        maxSize: THUMB_S,
        propertyName: "smallSrc",
        fileSuffix: "s",
        caption: "small"
    },
    {
        maxSize: THUMB_M,
        propertyName: "mediumSrc",
        fileSuffix: "m",
        caption: "medium"
    },
    {
        maxSize: THUMB_L,
        propertyName: "largeSrc",
        fileSuffix: "l",
        caption: "large"
    },
    ...( useImageKit ? _imageKitAdditionalThumbs : [] )
];

const _suffixes = _thumbnailSpecs.map(spec => spec.fileSuffix).join('|');
const _thumbNameRegexPattern = `^(?<imageName>.+)_(${_suffixes})\\.(?<extension>.+)$`;
const _thumbNameRegex = new RegExp(_thumbNameRegexPattern, "i");

// Used in admin to check images vs. thumbnails (getMissingImagesVersusThumbnails)
export function getImageNameFromThumbnail(thumbName) {
    const match = thumbName.match(_thumbNameRegex);
    if (match) {
        return `${match.groups.imageName}.${match.groups.extension}`;
    }
    throw new Error(`Unexpected thumbnail name ${thumbName}`);
}

// Used in admin to create thumbails when uploading an image or delete thumbnails when deleting an image
export function getThumbnailsFromImageName(itemFullName) {
    return _thumbnailSpecs.map(thumbSpec => _getThumbSrc(itemFullName, thumbSpec));
}
// Used in admin to create thumbails when uploading an image or delete thumbnails when deleting an image
export function getFileNameFromFullPath(fullPath) {
    // fullPath is like "xx/yy/zz/fileName.ext"
    const lastSlashPosition = fullPath.lastIndexOf("/");
    const fileName = fullPath.substring(lastSlashPosition + 1);
    return fileName;
}

function _getThumbSrc(image, thumbSpec) {
    const isImage = typeof image !== 'string';
    const encodedSrc = isImage ? image.src : image;
    const src = decodeURIComponent(encodedSrc);
    if (useImageKit) {
        // image (or image.src) is like
        // - dev:  "http://192.168.1.38:9199/photosub.appspot.com      /2022/bajacalifornia/DSC_7648-NEF_DxO_DeepPRIMEXD-Modifier.jpg"
        // - prod: "https://storage.googleapis.com/photosub.appspot.com/2024/halmahera     /DSC_4442-Modifier.jpg
        // With imageKit:
        // - dev:  https://ik.imagekit.io/lmpvkcer3/emulator/tr:w-1200/2026/essai1/DSC_5221.jpg
        // - prod: https://ik.imagekit.io/lmpvkcer3         /tr:w-1200/2024/halmahera/DSC_4569-Modifier.jpg

        // we configured imageKit to restrict url to named transformations
        const ikNamedTransformation = thumbSpec.caption.replace(/ /g, '_');
        const bucketName = "photosub.appspot.com";
        const bucketNamePos = src.indexOf(bucketName);
        const imagePath = src.substring(bucketNamePos + bucketName.length + 1); // "2022/bajacalifornia/..."
        const isDev = process.env.NODE_ENV === "development";
        let imageKitEndpoint = "https://ik.imagekit.io/lmpvkcer3";
        if (isDev) {
            imageKitEndpoint += "/emulator";
        }
        if (isImage) {
            // imageKit SEO:
            const captionItems = parseSingleDescription(image.description);
            if (captionItems && captionItems.length > 0) {
                // keep first species only:
                const captionItem = captionItems[0];
                // Black Skipjack (Euthynnus lineatus) => Black-Skipjack_Euthynnus-lineatus
                // captionItem.vernacular is an array
                // captionItem.scientific is a string
                const seoFriendlyFileName = `${captionItem.vernacular[0]}_${captionItem.scientific}`.replace(/ /g, '-');

                const dotPosition = imagePath.lastIndexOf(".");
                const fileExtension = imagePath.substring(dotPosition + 1);
                const imagePathWithoutExtension = imagePath.substring(0, dotPosition);

                const imageKitUrl = `${imageKitEndpoint}/ik-seo/tr:n-${ikNamedTransformation}/${imagePathWithoutExtension}/${encodeURIComponent(seoFriendlyFileName)}.${fileExtension}`;
                return imageKitUrl;
            }
        }
        return `${imageKitEndpoint}/tr:n-${ikNamedTransformation}/${imagePath}`;


    } else {
        // src is like https://<host>/folder1/folder2/DSC_2264.jpg
        // we want a new path to the thumbnail as https://<host>/folder1/folder2/thumbs/DSC_2264_[s|m|l|xs].jpg
        const dotPosition = src.lastIndexOf(".");
        const lastSlashPosition = src.lastIndexOf("/");

        const fileDir = src.substring(0, lastSlashPosition);
        const fileName = src.substring(lastSlashPosition + 1, dotPosition);
        const fileExtension = src.substring(dotPosition);
        return `${fileDir}/${_thumbsSubFolder}/${fileName}_${thumbSpec.fileSuffix}${fileExtension}`;
    }
}

function getThumbnailFromSpec(image, sizeSpec) {
    if (typeof image !== 'string' && image.hasOwnProperty(sizeSpec.propertyName)) {
        return image[sizeSpec.propertyName];
    }
    return _getThumbSrc(image, sizeSpec);
}

export function getThumbnailSrc(image, containerWidth, containerHeight) {
    if (!image) {
        return null;
    }
    let actualWidth = containerWidth;
    let longestEdge = actualWidth;
    if (image.sizeRatio !== undefined) {

        let actualHeight = null;
        if (containerHeight !== undefined ) {
            // Check if the image height, based on the available width is less or equal than available height
            actualHeight = actualWidth / image.sizeRatio;
            if (actualHeight > containerHeight) {
                // make the image fitting the max available height
                actualHeight = containerHeight;
                // and compute the corresponding width
                actualWidth = actualHeight * image.sizeRatio;
            }
        }

        // Update longest edge
        if (image.sizeRatio > 1) {
            // Landscape -> longest edge = width
            longestEdge = actualWidth;
        } else {
            // Portrait  -> longest edge = height
            // -> compute actuelHeight if not already known (containerHeight is undefined)
            longestEdge = actualHeight || (actualWidth / image.sizeRatio);
        }
    }

    for (const sizeSpec of _thumbnailSpecs) {
        if (sizeSpec.maxSize >= longestEdge) {
            return getThumbnailFromSpec(image, sizeSpec);
        }
    }

    // Must NOT happen with imageKit:
    // -> with imageKit, we have the last thumb size for all images < THUMB_MAX (100000)
    // -> as a fallback here, we return the largest thumb
    if (useImageKit) {
        const lastSpec = _thumbnailSpecs[_thumbnailSpecs.length - 1];
        return getThumbnailFromSpec(image, lastSpec);
    }

    // If not imageKit, return the original image src
    return typeof image === 'string' ? image : image.src;
}

export function clearThumbnailSrc(image) {
    for (let sizeSpec of _thumbnailSpecs) {
        delete image[sizeSpec.propertyName];
    }
    return image;
}
