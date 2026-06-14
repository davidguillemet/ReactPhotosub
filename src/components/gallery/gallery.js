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
import { useNavigate, useLocation } from 'react-router';
import { Box, Collapse } from '@mui/material';
import { useTranslation } from 'utils';
import { Body } from '../../template/pageTypography';
import { getSubGalleryAnchorName } from 'utils';
import { VerticalSpacing } from 'template/spacing';
import { GalleryContextProvider } from './galleryContext';
import { useGalleryContext } from './galleryContext';
import { useAuthContext } from 'components/authentication';
import { buildGroups } from './groupUtils';
import { useAsyncFetcher } from 'components/reactRouter';
import { APP_ROUTE_PATH } from 'navigation/routes';

const _colWidth = {
    "small": {
        mobile: 100,
        desktop: 200
    },
    "medium": {
        mobile: 170,
        desktop: 350
    },
    "large": {
        mobile: 200,
        desktop: 400
    }
}

const GroupGallery = ({images, onReady, renderItem}) => {

    const galleryContext = useGalleryContext();

    const heightProvider = useCallback((item, itemWidth) => {
        return itemWidth / item.sizeRatio;
    }, []);

    const colWidth = _colWidth[galleryContext.colWidth][isMobile ? "mobile" : "desktop"];

    return (
        <MasonryGallery
            items={images}
            colWidth={colWidth}
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

const StringGroupTitle = ({group}) => {
    const t = useTranslation("components.gallery");
    const groupTitle =
        group.showCount ?
        `${group.caption} - ${t("lbl:groupImageCount", group.images.length)}` :
        group.caption;
     return <Box><span id={getSubGalleryAnchorName(group.gallery?.location_title || group.caption)}>{groupTitle}</span></Box>;
};

const GroupTitle = ({group, onToggleExpanded}) => {
    if (typeof group.caption === "string") {
        return <StringGroupTitle group={group} />;
    } else if (typeof group.caption === "function") {
        const TitleComponent = group.caption;
        return <TitleComponent group={group} onToggleExpanded={onToggleExpanded} />;
    }
}

const GroupGalleryWithHeader = ({
    group,
    allImages,
    onReady,
    renderItem,
    groupHeaderEndComponent}) => {

    const authContext = useAuthContext();
    const [isExpanded, setIsExpanded] = useState(group.closed !== undefined ? !group.closed : true);

    const onToggleExpanded = useCallback(() => {
        setIsExpanded(prevValue => !prevValue);
    }, []);

    const GroupHeaderEndComponent = groupHeaderEndComponent;

    if (!authContext.admin && (!group.images || group.images.length === 0)) {
        return null;
    }

    return (
        <Stack sx={{width: '100%'}}>
            <BlockQuote
                sx={{
                    mb: 1,
                    mt: 3,
                    ml: 0,
                    pl: 1,
                    pr: 1,
                    fontWeight: "bold",
                    bgcolor: theme => theme.palette.background.paperLight,
                }}
            >
                <Stack
                    direction='row'
                    sx={{
                        width: '100%',
                        pt: 1,
                        pb: 1,
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }} 
                >
                    <GroupTitle group={group} onToggleExpanded={onToggleExpanded} />
                    {
                        groupHeaderEndComponent !== null &&
                        <GroupHeaderEndComponent group={group} />
                    }
                    <IconButton onClick={onToggleExpanded} >
                        {
                            isExpanded
                            ? <ExpandLessOutlinedIcon  />
                            : <ExpandMoreOutlinedIcon  />
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
    onImageClick = null,
    groupBuilder = null,
    groupHeaderEndComponent = null,
    renderOverlay = null,
    imageAdminTools = null,
    // By default sort images by date, descending, i.e. from the most recent to the oldest
    sort = "desc", // "desc", "asc", "none"
    pushHistory = false,
    withFavorite = true,
    colWidth = "medium",
    launchSlideshow = 0}) => {

    const { submit: portfolioSubmit } = useAsyncFetcher(`portfolioButton`, APP_ROUTE_PATH);

    const navigate = useNavigate();
    const location = useLocation();

    const [expandedImageIndex, setExpandedImageIndex] = useState(null);
    const [autoPlay, setAutoPlay] = useState(false);

    useEffect(() => {
        if (launchSlideshow > 0) {
            setAutoPlay(true);
            setExpandedImageIndex(0);
        }
    }, [launchSlideshow]);

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
        if (onImageClick) {
            onImageClick(index);
            return;
        }

        if (pushHistory === true) {
            let search = null;
            if (index !== null) {
                const image = images[index];
                search = '?' + new URLSearchParams({image: `${image.path}/${image.name}`}).toString();
            }
            if (location.search === search) {
                return;
            }
            navigate({
                pathname: location.pathname,
                search: search
            });
        } else {
            setExpandedImageIndex(index)
        }
    }, [pushHistory, images, navigate, location.search, location.pathname, onImageClick]);

    const onCloseModal = useCallback(() => {
        setAutoPlay(false);
        handleOnImageClick(null);
    }, [handleOnImageClick]);

    const renderItem = useCallback((item, index, width, groupIndex) => {
        const offset = groups[groupIndex].offset;
        return (
            <LazyImage
                index={index + offset}
                image={item}
                onClick={handleOnImageClick}
                width={width}
                withFavorite={withFavorite}
                renderOverlay={renderOverlay}
                adminTools={imageAdminTools}
            />
        )
    }, [groups, withFavorite, renderOverlay, imageAdminTools, handleOnImageClick]);

    if (images.length === 0 && emptyMessage !== null) {
        return (
            <Alert severity="info" >{emptyMessage}</Alert>
        );
    }

    return (
        <GalleryContextProvider
            options={{
                withFavorite,
                colWidth,
                portfolioSubmit
            }
        }>
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
                            key={"emptyGroup"}
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
                        autoPlay={autoPlay}
                    />
                }
            </Dialog>
        </GalleryContextProvider>
    );
}

export default withLoading(Gallery, [buildLoadingState("images", [null, undefined])]);