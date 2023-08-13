import React, { useState, useMemo, useEffect, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';

import {isMobile} from 'react-device-detect';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import LazyImage from '../lazyImage';
import ExpandedView from './expandedView';
import { withLoading, buildLoadingState } from '../../components/hoc';
import MasonryGallery from '../masonryGallery';
import { BlockQuote } from '../../template/pageTypography';
import { useHistory, useLocation } from 'react-router-dom';
import { Box, Collapse } from '@mui/material';

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

const GroupGallery = ({images, onReady, renderItem}) => {

    const heightProvider = useCallback((item, itemWidth) => {
        return itemWidth / item.sizeRatio;
    }, []);

    return (
        <MasonryGallery
            items={images}
            colWidth={isMobile ? 170 : 350}
            heightProvider={heightProvider}
            renderItem={renderItem}
            onReady={onReady}
        />
    )
}

const GroupGalleryWithHeader = ({group, allImages, onReady, renderItem}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const onToggleExpanded = useCallback(() => {
        setIsExpanded(prevValue => !prevValue);
    }, []);

    return (
        <Stack sx={{width: '100%'}}>
            <BlockQuote sx={{
                mb: 1,
                mt: 3,
                ml: 0,
                pl: 1,
                pr: 1,
                fontWeight: "bold",
                color: theme => theme.palette.primary.contrastText,
                bgcolor: theme => theme.palette.primary.light}}
            >
                <Stack
                    sx={{width: '100%'}} direction='row'
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box>{group.key} - {`${group.images.length} images`}</Box>
                    <IconButton
                        sx={{color: theme => theme.palette.primary.contrastText}}
                        onClick={onToggleExpanded}
                    >
                        {
                            isExpanded
                            ? <ExpandLessOutlinedIcon fontSize="large" />
                            : <ExpandMoreOutlinedIcon fontSize="large" />
                        }
                    </IconButton>
                </Stack>
            </BlockQuote>
            <Collapse in={isExpanded === true}>
                <GroupGallery
                    images={group.images}
                    key={group.key}
                    onReady={onReady}
                    renderItem={renderItem}
                    allImages={allImages}
                />
            </Collapse>
        </Stack>
    )
}

function getViewImage(querySearch) {
    const queryParameters = new URLSearchParams(querySearch)
    return queryParameters.get("image");
}

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
    sort = "desc",
    pushHistory = false}) => {

    const history = useHistory();
    const location = useLocation();

    const [expandedImageIndex, setExpandedImageIndex] = useState(null);

    const [groups, allImages] = useMemo(() => groupFavorites(images, groupBy, sort), [images, groupBy, sort]);

    // location.search has been modified after history.push
    useEffect(() => {
        if (images === undefined || pushHistory === false) {
            return;
        }
        const imageFullPath = getViewImage(location.search);
        const imageIndex =
            imageFullPath !== null ?
            images.findIndex(image => imageFullPath.endsWith(image.name)) :
            null;
        setExpandedImageIndex(imageIndex);
    }, [location.search, images, pushHistory]);

    const handleOnImageClick = useCallback((index) => {
        if (pushHistory === true) {
            let search = null;
            if (index !== null) {
                const image = images[index];
                search = '?' + new URLSearchParams({image: `${image.path}/${image.name}`}).toString();
            }
            if (location.search === search) {
                return;
            }
            history.push({
                pathname: location.pathname,
                search: search
            });
        } else {
            setExpandedImageIndex(index)
        }
    }, [pushHistory, images, history, location.search, location.pathname]);

    const onImageClick = useCallback((imageIndex) => {
        handleOnImageClick(imageIndex);
    }, [handleOnImageClick]);

    const onCloseModal = useCallback(() => {
        handleOnImageClick(null);
    }, [handleOnImageClick]);

    const renderItem = useCallback((item, index, width, groupIndex) => {
        const offset = groups[groupIndex].offset;
        return (
            <LazyImage
                index={index + offset}
                image={item}
                onClick={onImageClick}
                width={width}
            />
        )
    }, [groups, onImageClick]);

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
                        <GroupGalleryWithHeader
                            group={group}
                            key={group.key}
                            groupIndex={groupIndex}
                            onReady={onReady}
                            renderItem={(item, index, width) => renderItem(item, index, width, groupIndex)}
                            allImages={allImages}
                        />
                        :
                        <GroupGallery
                            images={group.images}
                            key={group.key}
                            groupIndex={groupIndex}
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
                        onChangeIndex={handleOnImageClick}
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