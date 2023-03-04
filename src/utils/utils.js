import {getUA} from 'react-device-detect';

export function formatDate(tripDate, locale) {
    const options = { year: 'numeric', month: 'long' };
    const formattedDate = tripDate.toLocaleDateString(locale, options);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export function formatDateShort(tripDate, locale) {
    const options = { year: 'numeric', month: 'short' };
    const formattedDate = tripDate.toLocaleDateString(locale, options);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
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

export const _thumbnailSpecs = [
    {
        maxSize: THUMB_XS,
        propertyName: "extraSmallSrc",
        fileSuffix: "xs",
        caption: "Extra small"
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
    }
];

const _suffixes = _thumbnailSpecs.map(spec => spec.fileSuffix).join('|');
const _thumbNameRegexPattern = `^(?<imageName>.+)_(${_suffixes})\\.(?<extension>.+)$`;
const _thumbNameRegex = new RegExp(_thumbNameRegexPattern, "i");

export function getImageNameFromThumbnail(thumbName) {
    const match = thumbName.match(_thumbNameRegex);
    if (match) {
        return `${match.groups.imageName}.${match.groups.extension}`;
    }
    throw new Error(`Unexpected thumbnail name ${thumbName}`);
}

export function getThumbnailsFromImageName(itemFullName) {
    return _thumbnailSpecs.map(thumbSpec => _getThumbSrc(itemFullName, thumbSpec.fileSuffix));
}

function _getThumbSrc(encodedSrc, fileSuffix) {
    // src is like https://<host>/folder1/folder2/DSC_2264.jpg
    // we want a new path to the thumbnail as https://<host>/folder1/folder2/thumbs/DSC_2264_[s|m|l|xs].jpg
    const src = decodeURIComponent(encodedSrc);
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

/**
 * Retourne une fonction qui, tant qu'elle est appelée,
 * n'est exécutée au plus qu'une fois toutes les N millisecondes.
 * Paramètres :
 *  - func : la fonction à contrôler
 *  - wait : le nombre de millisecondes (période N) à attendre avant 
 *           de pouvoir exécuter à nouveau la function func()
 *  - leading (optionnel) : Appeler également func() à la première
 *                          invocation (Faux par défaut)
 *  - trailing (optionnel) : Appeler également func() à la dernière
 *                           invocation (Faux par défaut)
 *  - context (optionnel) : le contexte dans lequel appeler func()
 *                          (this par défaut)
 */
export function throttle(func, wait, leading, trailing, context) {
    var ctx, args, result;
    var timeout = null;
    var previous = 0;
    var later = function() {
        previous = new Date();
        timeout = null;
        result = func.apply(ctx, args);
    };
    return function() {
        var now = new Date();
        if (!previous && !leading) previous = now;
        var remaining = wait - (now - previous);
        ctx = context || this;
        args = arguments;
        // Si la période d'attente est écoulée
        if (remaining <= 0) {
            // Réinitialiser les compteurs
            clearTimeout(timeout);
            timeout = null;
            // Enregistrer le moment du dernier appel
            previous = now;
            // Appeler la fonction
            result = func.apply(ctx, args);
        } else if (!timeout && trailing) {
            // Sinon on s’endort pendant le temps restant
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

/**
 * Retourne une fonction qui, tant qu'elle continue à être invoquée,
 * ne sera pas exécutée. La fonction ne sera exécutée que lorsque
 * l'on cessera de l'appeler pendant plus de N millisecondes.
 * Si le paramètre `immediate` vaut vrai, alors la fonction 
 * sera exécutée au premier appel au lieu du dernier.
 * Paramètres :
 *  - func : la fonction à `debouncer`
 *  - wait : le nombre de millisecondes (N) à attendre avant 
 *           d'appeler func()
 *  - immediate (optionnel) : Appeler func() à la première invocation
 *                            au lieu de la dernière (Faux par défaut)
 *  - context (optionnel) : le contexte dans lequel appeler func()
 *                          (this par défaut)
 */
export function debounce(func, wait, immediate, context) {
    var result;
    var timeout = null;
    return function() {
        var ctx = context || this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) result = func.apply(ctx, args);
        };
        var callNow = immediate && !timeout;
        // Tant que la fonction est appelée, on reset le timeout.
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(ctx, args);
        return result;
    };
}

/* View in fullscreen */
export function openFullscreen() {
    /* Get the documentElement (<html>) to display the page in fullscreen */
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

/* Close fullscreen */
export function closeFullscreen() {
    if (document.fullscreenElement === null) {
        // To avoid "TypeError: Document not active"
        return;
    }
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}

export const isPrerenderUserAgent = () => {
    if (getUA.toLowerCase().indexOf('prerender') !== -1) {
        return true;
    }
    return false;
}