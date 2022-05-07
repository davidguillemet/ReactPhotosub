import React, { useState, useMemo } from 'react';
import {isMobile} from 'react-device-detect';
import { grey } from '@mui/material/colors';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import LazyImage from '../lazyImage';
import ExpandedView from './expandedView';
import { withLoading, buildLoadingState } from '../../components/hoc';
import MasonryGallery from '../masonryGallery';
import { BlockQuote } from '../../template/pageTypography';

const GROUP_BY_YEAR = "year";

const createGroup = (key) => {
    return {
        key: key,
        images: [],
        offset: 0
    };
}

const getImageProps = (image) => {
    // image path is "<year>/<name>"
    const props = image.path.split('/');
    return {
        year: props[0],
        name: props[1]
    };
}

const groupFavoritesByYear = (images) => {
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

const sortImagesDescending = (img1, img2) => {
    return img2.create > img1.create ? 1 : -1;
}

const sortImagesAscending = (img1, img2) => {
    return img1.create > img2.create ? 1 : -1;
}

const groupFavorites = (images, groupBy, sortOrder) => {
    let groups = null;

    if (groupBy === null) {
        // On global group without any label (destination gallery)
        const group = createGroup(null);
        group.images = [...images];
        groups = [group];
    } else if (groupBy === GROUP_BY_YEAR) {
        // Group by year
        groups = groupFavoritesByYear(images);
    } else {
        // Unknown group
        throw new Error(`Propriété de groupe '${groupBy}' invalide'`)
    }

    // sort images by date for each group
    groups.forEach(group => group.images.sort(sortOrder === "asc" ? sortImagesAscending : sortImagesDescending));

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

const GroupGallery = ({images, onReady, renderItem}) => (
    <MasonryGallery
        items={images}
        colWidth={isMobile ? 170 : 350}
        heightProvider={(item, itemWidth) => itemWidth / item.sizeRatio}
        renderItem={renderItem}
        onReady={onReady}
    />
)

const Gallery = ({
    images,
    count = null,
    emptyMessage = null,
    onReady = null,
    displayDestination = true,
    hasNext = false,
    onNextPage = null,
    groupBy = null,
    // By default sort images by date, descending, i.e. from the most recent to the oldest
    sort = "desc"}) => {

    const [expandedImageIndex, setExpandedImageIndex] = useState(null);

    const [ groups, allImages] = useMemo(() => groupFavorites(images, groupBy, sort), [images, groupBy, sort]);

    const renderItem = (item, index, width, groupIndex) => {
        const offset = groups[groupIndex].offset;
        return (
            <LazyImage
                index={index + offset}
                image={item}
                onClick={onImageClick}
                width={width}
            />
        )
    };

    function onImageClick(imageIndex) {
        setExpandedImageIndex(imageIndex);
    }

    function onCloseModal() {
        setExpandedImageIndex(null);
    }

    if (images.length === 0 && emptyMessage !== null) {
        return (
            <Alert severity="info" elevation={4} variant="filled">{emptyMessage}</Alert>
        );
    }

    return (
        <React.Fragment>

            {
                groups.map((group, groupIndex) => {
                    return (
                        group.key !== null ?
                        <Stack sx={{width: '100%'}} key={group.key}>
                            <BlockQuote sx={{mb: 1, mt: 3, ml: 0, pl: 1, bgcolor: grey[200]}}>{group.key}</BlockQuote>
                            <GroupGallery
                                images={group.images}
                                key={group.key}
                                onReady={onReady}
                                renderItem={(item, index, width) => renderItem(item, index, width, groupIndex)}
                                allImages={allImages}/>
                        </Stack>
                        :
                        <GroupGallery
                            images={group.images}
                            key={group.key}
                            onReady={onReady}
                            renderItem={(item, index, width) => renderItem(item, index, width, groupIndex)}
                            allImages={allImages}/>
                    )
                })
            }

            <Dialog
                open={expandedImageIndex !== null}
                onClose={onCloseModal}
                fullScreen={true}
            >
                {
                    // don't render ExpandedView if expandedImageIndex is null, otherwise we get a runtime error
                    expandedImageIndex !== null &&
                    <ExpandedView
                        images={allImages}
                        count={count || allImages.length}
                        index={expandedImageIndex}
                        onChangeIndex={setExpandedImageIndex}
                        onClose={onCloseModal}
                        displayDestination={displayDestination}
                        hasNext={hasNext}
                        onNextPage={onNextPage}
                    />
                }
            </Dialog>
        </React.Fragment>
    );
}

export default withLoading(Gallery, [buildLoadingState("images", [null, undefined])]);