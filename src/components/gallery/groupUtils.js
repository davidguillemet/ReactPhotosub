import { sortImagesAscending, sortImagesDescending } from 'utils';

export const createGroup = (key) => {
    return {
        key: key,
        images: [],
        offset: 0,
        showCount: true
    };
}

export const buildGroups = (images, groupBuilder, sortOrder) => {
    let groups = null;

    if (!groupBuilder) {
        // One global group without any label (destination gallery)
        const group = createGroup(null);
        group.images = [...images];
        groups = [group];
    } else {
        groups = groupBuilder(images);
    }

    // sort images by date for each group
    if (sortOrder !== "none") {
        groups.forEach(group => group.images.sort(sortOrder === "asc" ? sortImagesAscending : sortImagesDescending));
    }

    // Compute group offset
    let offset = 0;
    for (let index = 0; index < groups.length; index++) {
        groups[index].offset = offset;
        offset += groups[index].images.length;
    }

    // Merge images from each groups to display all images from all groups in the expanded view
    const allImages = groups.reduce((previousImages, group, index) => {
        Array.prototype.push.apply(previousImages, group.images);
        return previousImages;
    }, [])

    return [ groups, allImages];
}
