import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {isMobile} from 'react-device-detect';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import Fade from '@material-ui/core/Fade';
import { withLoading, buildLoadingState } from '../loading';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { useResizeObserver } from '../../components/hooks';

import Thumbnail from './thumbnail';
import './style.css';

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

const getLastThumbnailRightPosition = (images, height, borderWidth) => {
    return images.reduce((position, image) => position + Math.round(height*image.sizeRatio) + borderWidth*2, 0);
}

const ImageSlider = ({
    images,
    currentIndex,
    onThumbnailClick,
    style,
    imageHeight = 60,
    imageBorderWidth = 3,
    indicatorHeight = 14,
    imageBorderColor = "#000",
    imageBorderRadius = 3,
    disabled,
    onDeleteUploaded,
    emptyComponent = null,
    onNextPage = null,
    hasNext = false}) => {
    
    const [thumnailScrollActivation, setThumbnailScrollActivation] = useState({ scrollLeft: false, scrollRight: false });
    const lastThumbRight = useMemo(() => getLastThumbnailRightPosition(images, imageHeight, imageBorderWidth), [images, imageHeight, imageBorderWidth]);

    const resizeObserver = useResizeObserver(true);
    
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

    return (
        <Paper elevation={2} style={{
            ...style,
            display: 'flex',
            flexDirection: 'column',
        }}>

            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            }}>

                {
                    !isMobile &&
                    <Fade in={thumnailScrollActivation.scrollLeft}>
                    <IconButton onClick={handleThumbnailsScrollLeft} disabled={!thumnailScrollActivation.scrollLeft}>
                        <ArrowBackIosRoundedIcon fontSize="large"/>
                    </IconButton>
                    </Fade>
                }

                {
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
                            height: `${imageHeight + 2*imageBorderWidth + indicatorHeight}px`,
                            mt: `${indicatorHeight / 2}px`,
                            mx: `${2*imageBorderWidth}px`
                        }}
                    >
                        {
                            images.length === 0 && emptyComponent !== null ?
                            emptyComponent :
                            <TransitionGroup component={null}>
                            {
                                images.map((image, index) => { 
                                    return (
                                        <CSSTransition
                                            key={image.id}
                                            timeout={500}
                                            classNames="thumbnail"
                                        >                
                                            <Thumbnail
                                                key={image.id}
                                                image={image}
                                                index={index}
                                                handleClick={handleThumbnailClick}
                                                active={currentIndex === index}
                                                imageHeight={imageHeight}
                                                imageBorderWidth={imageBorderWidth}
                                                imageBorderColor={imageBorderColor}
                                                imageBorderRadius={imageBorderRadius}
                                                disabled={disabled}
                                                onDelete={onDeleteUploaded}
                                            />
                                        </CSSTransition>
                                    );
                                })
                            }
                            </TransitionGroup>
                        }
                        {
                            hasNext &&
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={onNextPage}
                                sx={{
                                    height: `${imageHeight}px`,
                                    mt: `${imageBorderWidth}px`,
                                    ml: `${imageBorderWidth}px`
                                }}
                                startIcon={<MoreHorizIcon />}
                            >
                            </Button>
                        }
                    </Box>
                }

                {
                    !isMobile &&
                    <Fade in={thumnailScrollActivation.scrollRight}>
                    <IconButton onClick={handleThumbnailsScrollRight} disabled={!thumnailScrollActivation.scrollRight}>
                        <ArrowForwardIosRoundedIcon fontSize="large"/>
                    </IconButton>
                    </Fade>
                }

            </Box>

        </Paper>
    );
}
export default withLoading(ImageSlider, [buildLoadingState("images", [null, undefined])]);
