import { useEffect, useState, useRef } from 'react';
export function formatDate(tripDate, locale) {
    const options = { year: 'numeric', month: 'long' };
    const formatedDate = tripDate.toLocaleDateString(locale, options);
    return formatedDate.charAt(0).toUpperCase() + formatedDate.slice(1);
}

function debounce(fn, ms) {
    let timer
    return () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            timer = null
            fn.apply(this, arguments)
        }, ms)
    };
}

export function resizeEffectHook(elementRef, onResize) {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [elementWidth, setElementWidth] = useState(0);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const debouncedHandleResize = debounce(function handleResize() {
            setElementWidth(elementRef.current.clientWidth);
            if (onResize) {
                onResize();
            }
        }, 200);
        setElementWidth(elementRef.current.clientWidth);
        window.addEventListener("resize", debouncedHandleResize);
        return () => window.removeEventListener("resize", debouncedHandleResize);
    }, [elementRef, onResize]);

    return elementWidth;
}

export function useEventListener(eventName, handler) {
    // Create a ref that stores handler
    const savedHandler = useRef();

    // Update ref.current value if handler changes.
    // This allows our effect below to always get latest handler ...
    // ... without us needing to pass it in effect deps array ...
    // ... and potentially cause effect to re-run every render.
    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(
        () => {
            // Make sure element supports addEventListener
            // On 
            const isSupported = window && window.addEventListener;
            if (!isSupported) return;

            // Create event listener that calls handler function stored in ref
            const eventListener = event => savedHandler.current(event);

            // Add event listener
            window.addEventListener(eventName, eventListener);

            // Remove event listener on cleanup
            return () => {
                window.removeEventListener(eventName, eventListener);
            };
        },
        [eventName] // Re-run if eventName changes
    );
};

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

const THUMB_XS = 150;
const THUMB_S  = 300;
const THUMB_M = 600;
const THUMB_L = 1200;
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

export function getThumbnailSrc(image, width) {
    
    for (const sizeSpec of _thumbnailSpecs) {
        if (sizeSpec.maxSize >= width) {
            if (typeof image === 'string') {
                // image is a strign and not an image object
                // -> just return the converted url
                return _getThumbSrc(image, sizeSpec.fileSuffix);
            }
            if (!image[sizeSpec.propertyName]) {
                image[sizeSpec.propertyName] = _getThumbSrc(image.src, sizeSpec.fileSuffix)
            }
            return image[sizeSpec.propertyName];
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
