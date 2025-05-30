import {getUA} from 'react-device-detect';

export const sortImagesDescending = (img1, img2) => {
    return img2.create > img1.create ? 1 : -1;
}

export const sortImagesAscending = (img1, img2) => {
    return img1.create > img2.create ? 1 : -1;
}

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

export function parseSingleDescription(desc) {
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
    // Return 2 properties fr and en as the supported languages
    return {
        fr: parseSingleDescription(image.title),
        en: parseSingleDescription(image.description)
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

export const getPropFromLanguage = (prop, language) => { 
    switch (language) {
        case 'fr':
            return prop;
        case 'en':
            return `${prop}_en`;
        default:
            throw new Error(`Unsupported language ${language}`);
    }
};

export const compareRegions = (lang) => {
    const titleProperty = getPropFromLanguage("title", lang);
    return (a, b) => a[titleProperty] === b[titleProperty] ? 0 : a[titleProperty] < b[titleProperty] ? -1 : 1;
}

export const regionTitle = (region, lang) => {
    return region ? region[getPropFromLanguage("title", lang)] : "";
}

export const destinationTitle = (destination, lang) => {
    return destination[getPropFromLanguage("title", lang)];
}

const _yearRegexp = /^[0-9]{4}$/i; 

export const extractDestinationPath = (path) => {
    const pathItems = path.split("/");
    if (pathItems.length === 2) {
        const title = pathItems[pathItems.length - 1];
        const year = pathItems[pathItems.length - 2];
        if (_yearRegexp.test(year)) {
            return `${year}/${title}`
        }
    }
    return null;
}

export const isDestinationPath = (path) => {
    if (path !== null &&
        path !== undefined &&
        path.length > 0 &&
        extractDestinationPath(path) !== null) {
        return true;
    }
    return false;
}

export const getSubGalleryAnchorName = (subGalleryTitle) => {
    return subGalleryTitle.replace(/ /g, "_");
}

export function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export function validatePassword(pwd) {
    // Customized password rules:
    // https://console.firebase.google.com/u/0/project/photosub/authentication/settings
    return pwd !== null && pwd !== undefined && pwd.length >= 6;
}
