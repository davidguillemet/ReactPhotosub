import { createGroup } from "components/gallery";
import { getPropFromLanguage } from "utils";

const globalGroupId = "[[global group]]";

const GroupBuilderFactory = (destination, galleries, language) => {
    
    if (galleries === null || galleries === undefined) {
        return null;
    }

    return (images) => {

        const groups = new Map();
        galleries.forEach(gallery => {
            const newGroup = createGroup(gallery[getPropFromLanguage("title", language)]);
            newGroup.index = gallery.index;
            newGroup.destination = destination;
            newGroup.gallery = gallery;
            newGroup.showCount = false;
            newGroup.desc = gallery[getPropFromLanguage("desc", language)];
            groups.set(gallery.id, newGroup);
        });

        images.forEach(image => {
            if (image.sub_gallery_id === null) {
                let globalGroup = groups.get(globalGroupId);
                if (globalGroup === undefined) {
                    globalGroup = createGroup(null);
                    globalGroup.index = 0;
                    groups.set(globalGroupId, globalGroup);
                }
                globalGroup.images.push(image);
            } else {
                let currentGroup =  groups.get(image.sub_gallery_id);
                currentGroup.images.push(image);
            }
        });
        // Return an array of groups, sorted by year, descending
        return Array.from(groups.values()).sort((group1, group2) => { return group1.index > group2.index ? 1 : -1; });
    }
};

export default GroupBuilderFactory;