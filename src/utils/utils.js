export function formatDate(tripDate, locale) {
    const options = { year: 'numeric', month: 'long' };
    const formatedDate = tripDate.toLocaleDateString(locale, options);
    return formatedDate.charAt(0).toUpperCase() + formatedDate.slice(1);
}

export function formatDateShort(tripDate, locale) {
    const options = { year: 'numeric', month: 'short' };
    const formatedDate = tripDate.toLocaleDateString(locale, options);
    return formatedDate.charAt(0).toUpperCase() + formatedDate.slice(1);
}

function parseSingleDescription(desc) {
    if (desc === null || desc === undefined || desc.length === 0) {
        return null;
    }
    const captionRegExp = /([^(]+)(?:\(([^)]+)\))?,?/g;
    let match = null;
    const captionItems = [];
    while ((match = captionRegExp.exec(desc)) !== null) {
        const captions = match[1];
        const captionsArray = captions.split(',').map(c => c.trim());
        const scientificName = match[2];
        captionItems.push({
            vernacular: captionsArray,
            scientific: scientificName
        });
    }
    return captionItems;
}

export function parseImageDescription(image) {
    return {
        french: parseSingleDescription(image.title),
        english: parseSingleDescription(image.description)
    };
}

function chr4() {
    return Math.random().toString(16).slice(-4);
}

export function uniqueID() {

    return chr4() + chr4() +
        '-' + chr4() +
        '-' + chr4() +
        '-' + chr4() +
        '-' + chr4() + chr4() + chr4();
}

export function shuffleArray(initialArray) {
    const newArray = Array.from(initialArray);
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = newArray[i]
        newArray[i] = newArray[j]
        newArray[j] = temp
    }
    return newArray;
}

const _blurrySubFolder = 'blurry';

export function getBlurrySrc(src) {
    // src is like https://<host>/homeslideshow/DSC_2264.jpg
    // we want a new path to the blurry version as https://<host>/homeslideshow/blurry/DSC_2264.jpg
    const path = src.split("/");
    path.splice(path.length - 1, 0, _blurrySubFolder);
    return path.join("/");
}

export function isBlurrySrc(src) {
    return src.includes(_blurrySubFolder);
}

export const THUMB_XS = 150;
export const THUMB_S  = 300;
export const THUMB_M = 600;
export const THUMB_L = 1200;
export const THUMB_LARGEST = THUMB_L;
export const THUMB_ORIGINAL = THUMB_L + 1;

const _thumbsSubFolder = 'thumbs';

const _thumbnailSpecs = [
    {
        maxSize: THUMB_XS,
        propertyName: "extraSmallSrc",
        fileSuffix: "xs"
    },
    {
        maxSize: THUMB_S,
        propertyName: "smallSrc",
        fileSuffix: "s"
    },
    {
        maxSize: THUMB_M,
        propertyName: "mediumSrc",
        fileSuffix: "m"
    },
    {
        maxSize: THUMB_L,
        propertyName: "largeSrc",
        fileSuffix: "l"
    }
];

function _getThumbSrc(src, fileSuffix) {
    // src is like https://<host>/folder1/folder2/DSC_2264.jpg
    // we want a new path to the blurry version as https://<host>/folder1/folder2/thumbs/DSC_2264_[s|m].jpg
    const dotPosition = src.lastIndexOf(".");
    const lastSlashPosition = src.lastIndexOf("/");

    const fileDir = src.substring(0, lastSlashPosition);
    const fileName = src.substring(lastSlashPosition + 1, dotPosition);
    const fileExtension = src.substring(dotPosition);
    return `${fileDir}/${_thumbsSubFolder}/${fileName}_${fileSuffix}${fileExtension}`;
}

function getThumbnailFromSpec(image, sizeSpec) {
    if (typeof image === 'string') {
        // image is a string and not an image object
        // -> just return the converted url
        return _getThumbSrc(image, sizeSpec.fileSuffix);
    }
    if (!image[sizeSpec.propertyName]) {
        image[sizeSpec.propertyName] = _getThumbSrc(image.src, sizeSpec.fileSuffix)
    }
    return image[sizeSpec.propertyName];
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

    return image.src;
}

export function clearThumbnailSrc(image) {
    for (let sizeSpec of _thumbnailSpecs) {
        delete image[sizeSpec.propertyName];
    }
    return image;
}
