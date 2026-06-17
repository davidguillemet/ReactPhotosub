import React from "react";
import { Box } from "@mui/material";
import { createGroup } from "components/gallery";
import LazyImage from "components/lazyImage";
import { formatDateShort, isLandscape } from "utils";
import { Paragraph } from 'template/pageTypography';
import {
    PORTFOLIO_CATEGORY_OTHER_KEY,
    buildPortfolioCategoryImageId,
    imageIsExcludedFromCategory,
    FILTER_VALUE_EXCLUDED_FROM_CATEGORY,
    FILTER_VALUE_INCLUDED_IN_CATEGORY
} from 'utils/portfolio';

const renderOverlayFactory = (caption) => {
    return ({image}) => {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderColor: theme => `${theme.palette.text.muted}60`,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    color: theme => theme.palette.text.primary,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-50%)'
                    }}
                >
                    <Paragraph sx={{color: theme => theme.palette.text.primary}}>{caption}</Paragraph>
                </Box>
            </Box>
        )
    };
};

// A method that returns a component to replace the Group caption as string
// by an image with the group caption as overlay
// eslint-disable-next-line no-unused-vars
const GroupHeaderFactory = (groupCaption) => {

    const GroupHeader = ({group, onToggleExpanded}) => {
        // Find the first landscape image in the group, and use it as the header image
        const image = group.images.find(isLandscape) || group.images[0];
        return (
            <LazyImage
                image={image}
                withOverlay={true}
                renderOverlay={renderOverlayFactory(groupCaption)}
                width={200}
                withFavorite={false}
                onClick={onToggleExpanded}
            />
        );
    };

    return GroupHeader;
};

const createPortfolioGroup = (key) => {
    const group = createGroup(key);
    group.closed = true;
    return group;
};

const getImageProps = (image) => {
    // image path is "<year>/<name>"
    const props = image.path.split('/');
    return {
        year: props[0],
        name: props[1]
    };
}

const dateGroupBuilder = (images) => {
    const imagesByYear = new Map();
    images.forEach((image) => {
        const imageProps = getImageProps(image);
        let yearGroup = imagesByYear.get(imageProps.year);
        if (yearGroup === undefined) {
            yearGroup = createPortfolioGroup(imageProps.year);
            yearGroup.caption = imageProps.year;
            imagesByYear.set(imageProps.year, yearGroup);
        }
        yearGroup.images.push(image);
    });
    // Return an array of groups, sorted by year, descending
    return Array.from(imagesByYear.values()).sort((group1, group2) => { return group2.key > group1.key ? 1 : -1; });
}

const getCategoryCaption = (category, language) => {
    return category[`caption_${language}`];
};

export const GroupBuilderFactory = (categories, language, translator, admin, filter) => {

    const destinationGroupBuilder = (images) => {
        const imagesByDest = new Map();
        const allDestinations = new Map();
        images.forEach((image) => {
            const destId = image.destination.id;
            let destGroup = imagesByDest.get(destId);
            if (!destGroup) {
                destGroup = createPortfolioGroup(destId);
                destGroup.caption = `${image.destination.title} - ${formatDateShort(new Date(image.destination.date), language)}`;
                imagesByDest.set(destId, destGroup);
                allDestinations.set(destId, image.destination);
            }
            destGroup.images.push(image);
        })
        return Array.from(imagesByDest.values()).sort((group1, group2) => {
            const dest1 = allDestinations.get(group1.key);
            const dest2 = allDestinations.get(group2.key);
            const date1 = new Date(dest1.date);
            const date2 = new Date(dest2.date);
            return date2 > date1 ? 1 : -1;
        }); 
    };

    const displayImage = (imageIsExcluded) => {
        if (!admin) {
            // If the user is not admin, we only show images that are not excluded from the category
            return !imageIsExcluded;
        }
        if (filter.includes(FILTER_VALUE_INCLUDED_IN_CATEGORY) && !imageIsExcluded) {
            // Show images that are included in the category, if the filter is set to "included"
            return true;
        }
        if (filter.includes(FILTER_VALUE_EXCLUDED_FROM_CATEGORY) && imageIsExcluded) {
            // Show images that are excluded from the category, if the filter is set to "excluded"
            return true;
        }
        // Otherwise, don't show the image
        return false;
    };

    const categoryGroupBuilder = (images) => {
        const imagesByCategory = new Map();
        const categorizedImages = new Set();
        images.forEach((image) => {
            const matchingCategories = categories.filter(cat => image.tags.includes(cat.key));
            matchingCategories.forEach((matchingCategory) => {
                let categoryGroup = imagesByCategory.get(matchingCategory.key);
                const imageIsExcluded = imageIsExcludedFromCategory(image, matchingCategory);
                if (!displayImage(imageIsExcluded)) {
                    return;
                }

                if (!categoryGroup) {
                    categoryGroup = createPortfolioGroup(matchingCategory.key);
                    categoryGroup.caption = getCategoryCaption(matchingCategory, language); //GroupHeaderFactory(translator(matchingCategory.label));
                    imagesByCategory.set(matchingCategory.key, categoryGroup);
                }
                // One unique Id per image in case it appears in multiple categories
                const catImage = {
                    ...image,
                    id: buildPortfolioCategoryImageId(image, matchingCategory),
                    groupKey: matchingCategory.key
                }
                categoryGroup.images.push(catImage);
            });
            if (matchingCategories.length > 0) {
                categorizedImages.add(image.id);
            }
        });

        // Add groups for empty categories (admin only)
        if (admin) {
            const unusedCategories = categories.filter(cat => !imagesByCategory.has(cat.key));
            if (unusedCategories.length > 0) {
                unusedCategories.forEach(unusedCategory => {
                    const unusedCatGroup = createPortfolioGroup(unusedCategory.key);
                    unusedCatGroup.caption = getCategoryCaption(unusedCategory, language);
                    imagesByCategory.set(unusedCategory.key, unusedCatGroup);
                });
            }
        }

        // Sort groups by caption alphabetically
        const orderedGroups = Array.from(imagesByCategory.values()).sort((group1, group2) => {
            return group1.caption > group2.caption ? 1 : -1;
        });

        // Add a group "other" for uncategorized images, if needed.
        // This group is added at the end of the list of categories.
        if (categorizedImages.size !== images.length) {
            const categoryKey = PORTFOLIO_CATEGORY_OTHER_KEY;
            const otherGroup = createPortfolioGroup(categoryKey)
            otherGroup.caption = translator("cat:other");
            orderedGroups.push(otherGroup);
            images.forEach(image => {
                if (!categorizedImages.has(image.id)) {
                    otherGroup.images.push(image);
                }
            });
        }

        return orderedGroups;
    };

    return {
        dateGroupBuilder,
        destinationGroupBuilder,
        categoryGroupBuilder
    }
}
