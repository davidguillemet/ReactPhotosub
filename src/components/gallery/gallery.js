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
import { useTranslation } from 'utils';
import { Body } from '../../template/pageTypography';
import { sortImagesAscending, sortImagesDescending, getSubGalleryAnchorName } from 'utils';
import { VerticalSpacing } from 'template/spacing';
import { GalleryContextProvider } from './galleryContext';

export const createGroup = (key) => {
    return {
        key: key,
        images: [],
        offset: 0,
        showCount: true
    };
}

const buildGroups = (images, groupBuilder, sortOrder) => {
    let groups = null;

    if (groupBuilder === null) {
        // One global group without any label (destination gallery)
        const group = createGroup(null);
        group.images = [...images];
        groups = [group];
    } else {
        groups = groupBuilder(images);
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

const GalleryDesc = ({group}) => {
    if (group.desc === null || group.desc === undefined) {
        return null;
    }
    const descRows = group.desc.split("\n");
    return descRows.map((row, index) => <Body sx={{mt: 0, mb: 0, fontWeight: "300"}} key={index}>{row}</Body>);
}

const GroupGalleryWithHeader = ({
    group,
    allImages,
    onReady,
    renderItem,
    groupHeaderEndComponent}) => {

    const t = useTranslation("components.gallery");
    const [isExpanded, setIsExpanded] = useState(true);

    const onToggleExpanded = useCallback(() => {
        setIsExpanded(prevValue => !prevValue);
    }, []);

    const GroupHeaderEndComponent = groupHeaderEndComponent;
    const groupTitle =
        group.showCount ?
        `${group.key} - ${t("lbl:groupImageCount", group.images.length)}` :
        group.key;

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
                    <Box><span id={getSubGalleryAnchorName(group.gallery?.location_title || group.key)}>{groupTitle}</span></Box>
                    {
                        groupHeaderEndComponent !== null &&
                        <GroupHeaderEndComponent group={group} />
                    }
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
                <VerticalSpacing factor={0.5} />
                <GalleryDesc group={group} />
                <VerticalSpacing factor={0.5} />
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
    groupBuilder = null,
    groupHeaderEndComponent = null,
    // By default sort images by date, descending, i.e. from the most recent to the oldest
    sort = "desc",
    pushHistory = false,
    withFavorite = true}) => {

    const history = useHistory();
    const location = useLocation();

    const [expandedImageIndex, setExpandedImageIndex] = useState(null);

    const [groups, allImages] = useMemo(() => buildGroups(images, groupBuilder, sort), [images, groupBuilder, sort]);

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
        <GalleryContextProvider options={{ withFavorite }}>
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
                            groupHeaderEndComponent={groupHeaderEndComponent}
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
        </GalleryContextProvider>
    );
}

export default withLoading(Gallery, [buildLoadingState("images", [null, undefined])]);