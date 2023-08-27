
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TitleIcon from '@mui/icons-material/Title';

export const GlobalImageErrors = [
    {
        id: "missingTags",
        hasError: (image) => image.tags === null,
        getErrorMessage: (/* image */) => "L'image n'a pas de tags",
        icon: LocalOfferIcon
    },
    {
        id: "missingTitle",
        hasError: (image) => (image.title === null && image.description !== null) || (image.title !== null && image.description === null),
        getErrorMessage: (image) => image.title === null ? "L'image a une description mais pas de titre" : "L'image a un titre mais pas de description",
        icon: TitleIcon
    }
];

export const CheckErrorsAfterAddImage = (errors, image) => {
    let modified = false;
    const newErrors = {};
    GlobalImageErrors.forEach(errorDef => {
        newErrors[errorDef.id] = [...errors[errorDef.id]];
        const currentErrors = newErrors[errorDef.id];
        if (currentErrors) {
            const errorImgIndex = findImageIndex(currentErrors, image);
            if (errorImgIndex !== -1 && !errorDef.hasError(image)) {
                // Remove the image from errors
                currentErrors.splice(errorImgIndex, 1);
                modified = true;
            } else if (errorImgIndex === -1 && errorDef.hasError(image)) {
                // The new uploaded image has errors and is not yet part of the errors
                currentErrors.push(image);
                modified = true;
            }
        }
    });
    return modified ? newErrors : null;
}

export const CheckErrorsAfterRemoveImage = (errors, image) => {
    let modified = false;
    const newErrors = {};
    GlobalImageErrors.forEach(errorDef => {
        newErrors[errorDef.id] = [...errors[errorDef.id]];
        const currentErrors = newErrors[errorDef.id];
        if (currentErrors && currentErrors.length > 0) {
            const errorImgIndex = findImageIndex(currentErrors, image);
            if (errorImgIndex !== -1) {
                // The removed image has no tags, just remove it from the error list
                currentErrors.splice(errorImgIndex, 1);
                modified = true;
            }
        }
    });
    return modified ? newErrors : null;
}

const findImageIndex = (imageArr, imageOrFullPath) => {
    if (typeof imageOrFullPath === 'string') {
        const fullPath = imageOrFullPath;
        return imageArr.findIndex(image => `${image.path}/${image.name}` === fullPath);
    } else {
        const image = imageOrFullPath;
        return imageArr.findIndex(img => image.name === img.name && image.path === img.path);
    }
}
