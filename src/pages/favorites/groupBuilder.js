import { createGroup } from "components/gallery";

const getImageProps = (image) => {
    // image path is "<year>/<name>"
    const props = image.path.split('/');
    return {
        year: props[0],
        name: props[1]
    };
}

const GroupBuilder = (images) => {
    const imagesByYear = new Map();
    images.forEach((image) => {
        const imageProps = getImageProps(image);
        let yearGroup = imagesByYear.get(imageProps.year);
        if (yearGroup === undefined) {
            yearGroup = createGroup(imageProps.year);
            imagesByYear.set(imageProps.year, yearGroup);
        }
        yearGroup.images.push(image);
    });
    // Return an array of groups, sorted by year, descending
    return Array.from(imagesByYear.values()).sort((group1, group2) => { return group2.key > group1.key ? 1 : -1; });
}

export default GroupBuilder;