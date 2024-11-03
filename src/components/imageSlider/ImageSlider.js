import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {isMobile} from 'react-device-detect';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { withLoading, buildLoadingState } from '../hoc';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';

import { useResizeObserver } from '../../components/hooks';

import Thumbnail from './thumbnail';
import './style.css';

const _nextPageButtonWidth = 60;

const getThumbnailRectAt = (container, index) => {
    if (container === null || index > container.children.length - 1) {
        return null;
    }
    const thumbnail = container.children[index];
    return {
        left: thumbnail.offsetLeft - container.offsetLeft,
        width: thumbnail.clientWidth
    };
};

const getLastThumbnailRightPosition = (images, height, spacing, hasNext) => {
    const initialValue = hasNext ? (_nextPageButtonWidth + spacing) : 0;
    return images.reduce((position, image) => position + Math.round(height*image.sizeRatio) + spacing, initialValue );
}

const ImageSlider = ({
    images,
    selectable = true,
    currentIndex,
    onThumbnailClick,
    style,
    imageHeight = 60,
    spacing = 5,
    disabled,
    onDeleteUploaded,
    emptyComponent = null,
    onNextPage = null,
    hasNext = false,
    renderOverlay = null,
    resetScrollOnChangeImages = false}) => {
    
    const [thumbnailScrollActivation, setThumbnailScrollActivation] = useState({ scrollLeft: false, scrollRight: false });
    const lastThumbRight = useMemo(() => getLastThumbnailRightPosition(images, imageHeight, spacing, hasNext), [images, imageHeight, spacing, hasNext]);

    const resizeObserver = useResizeObserver(true);

    const [searchRunning, setSearchRunning] = useState(false);
    
    const scrollToThumbnail = useCallback((index) => {

        if (resizeObserver.width === 0) {
            return;
        }

        const thumbnailRect = getThumbnailRectAt(resizeObserver.element, index);

        if (thumbnailRect === null) {
            return;
        }

        const scrollThumbnailContainer = (targetScroll) => {
            resizeObserver.element.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        };
    
        const thumbnailLeftVisualPosition = thumbnailRect.left - resizeObserver.element.scrollLeft;
        if (thumbnailLeftVisualPosition < 0) {
            scrollThumbnailContainer(thumbnailRect.left);
            return;
        }

        const thumbnailRightVisualPosition = thumbnailLeftVisualPosition + thumbnailRect.width;
        if (thumbnailRightVisualPosition > resizeObserver.width) {
            scrollThumbnailContainer(resizeObserver.element.scrollLeft + thumbnailRightVisualPosition - resizeObserver.width);
        }
    }, [resizeObserver.width, resizeObserver.element]);

    const handleThumbnailClick = useCallback((index, ignoreClickCallback) => {
        if (disabled) {
            // display a feedback?
            return;
        }

        if (ignoreClickCallback !== true) {
            // ignoreClickCallback is true when called the current index changed from the parent
            // In this case, we don't need to notify the parent from the click...
            onThumbnailClick(index); 
        }
        scrollToThumbnail(index);
    }, [scrollToThumbnail, onThumbnailClick, disabled]);

    useEffect(() => {
        // Simulate click handle each time the current index changes
        if (currentIndex >= 0) {
            handleThumbnailClick(currentIndex, true);
        }
    }, [currentIndex, handleThumbnailClick]);

    useEffect(() => {
        setThumbnailScrollActivation({
            scrollLeft: resizeObserver.scrollLeft > 0,
            scrollRight: lastThumbRight > resizeObserver.width + resizeObserver.scrollLeft
        });
    }, [resizeObserver.width, resizeObserver.scrollLeft, lastThumbRight]);

    useEffect(() => {
        setSearchRunning(false);
        if (resetScrollOnChangeImages === true && resizeObserver.element !== null) {
            resizeObserver.element.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }
    }, [images, resizeObserver.element, resetScrollOnChangeImages]);

    function handleThumbnailsScrollLeft() {
        resizeObserver.element.scrollBy({
            left: -resizeObserver.width,
            behavior: 'smooth'
        });
    }

    function handleThumbnailsScrollRight() {
        resizeObserver.element.scrollBy({
            left: resizeObserver.width,
            behavior: 'smooth'
        });
    }

    const handleNextSearchPage = useCallback(() => {
        if (onNextPage !== null) {
            onNextPage();
            setSearchRunning(true);
        }
    }, [onNextPage]);

    return (
        <Box
            sx={{
                ...style,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            }}
        >
            {
                !isMobile &&
                <IconButton
                    onClick={handleThumbnailsScrollLeft}
                    disabled={!thumbnailScrollActivation.scrollLeft}
                    size="small">
                    <ArrowCircleLeftOutlinedIcon fontSize="inherit"/>
                </IconButton>
            }

            <Box
                ref={resizeObserver.ref}
                className="hideScroll" 
                sx={{
                    flex: 1,
                    overflowY: 'hidden',
                    overflowX: 'auto',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    paddingTop: '8px',
                    height: `${imageHeight + 8*2}px`, // 8px top & bottom for selection shadow and thumbnail translate
                    mx: 0
                }}
            >
                {
                    images.length === 0 && emptyComponent !== null ?
                    emptyComponent :
                    <TransitionGroup component={null}>
                    {
                        images.map((image, index) => { 
                            const thumbnailRef = React.createRef(null);
                            return (
                                <CSSTransition
                                    key={image.id}
                                    nodeRef={thumbnailRef}
                                    timeout={500}
                                    classNames="thumbnail"
                                >                
                                    <Thumbnail
                                        key={image.id}
                                        selectable={selectable}
                                        ref={thumbnailRef}
                                        image={image}
                                        index={index}
                                        handleClick={handleThumbnailClick}
                                        selected={currentIndex === index}
                                        imageHeight={imageHeight}
                                        spacing={spacing}
                                        disabled={disabled}
                                        onDelete={onDeleteUploaded}
                                        renderOverlay={renderOverlay}
                                    />
                                </CSSTransition>
                            );
                        })
                    }
                    </TransitionGroup>
                }
                {
                    hasNext &&
                    <LoadingButton
                        loading={searchRunning}
                        variant="outlined"
                        size="large"
                        onClick={handleNextSearchPage}
                        sx={{
                            height: `${imageHeight}px`,
                            mr: `${spacing}px`,
                            minWidth: `${_nextPageButtonWidth}px`,
                            px: 1,
                            '& .MuiButton-startIcon': {
                                mr: 0
                            }
                        }}
                        startIcon={<MoreHorizIcon />}
                    >
                    </LoadingButton>
                }
            </Box>

            {
                !isMobile &&
                <IconButton
                    onClick={handleThumbnailsScrollRight}
                    disabled={!thumbnailScrollActivation.scrollRight}
                    size="small">
                    <ArrowCircleRightOutlinedIcon fontSize="inherit"/>
                </IconButton>
            }
        </Box>
    );
}
export default withLoading(ImageSlider, [buildLoadingState("images", [null, undefined])]);
