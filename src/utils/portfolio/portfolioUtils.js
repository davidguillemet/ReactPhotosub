export const buildPortfolioCategoryImageId = (image, category) => {
    return `${image.id}|${category.key}`;
}

export const parsePortfolioCategoryImageId = (imageId) => {
    if (typeof imageId !== 'string') {
        return imageId;
    }
    const parts = imageId.split('|');
    if (parts.length !== 2) {
        return imageId;
    }
    return parseInt(parts[0]);
}

export const imageIsExcludedFromCategory = (image, category) => {
    if (!image || !category) {
        return false;
    }
    if (!image.excluded_cats || !Array.isArray(image.excluded_cats)) {
        return false;
    }
    return image.excluded_cats.includes(category.key);
}

