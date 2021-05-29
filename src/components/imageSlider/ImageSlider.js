import React, { useState, useRef, useCallback, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import Skeleton from '@material-ui/lab/Skeleton';
import Fade from '@material-ui/core/Fade';
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
    emptyComponent = null}) => {
    
    const [thumnailScrollActivation, setThumbnailScrollActivation] = useState({ scrollLeft: false, scrollRight: false });
    const [lastThumbRight, setLastThumbRight] = useState(0);
    const numberOfLoadedThumbnails = useRef(0);

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
        numberOfLoadedThumbnails.current = 0;
        setLastThumbRight(0);
    }, [images]);

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

    const onThumbnailLoadedCallback = useCallback(() => {
        numberOfLoadedThumbnails.current++;
        if (numberOfLoadedThumbnails.current === images.length) {
            const lastThumbRect = getThumbnailRectAt(resizeObserver.element, images.length - 1);
            setLastThumbRight(lastThumbRect.left + lastThumbRect.width);
        }
    }, [images, resizeObserver.element]);

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
        <Paper elevation={4} style={{
            ...style,
            display: 'flex',
            flexDirection: 'column',
        }}>

            <Box style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            }}>

                { /* TODO : remove on mobile device */ }
                <Fade in={thumnailScrollActivation.scrollLeft}>
                <IconButton onClick={handleThumbnailsScrollLeft} disabled={!thumnailScrollActivation.scrollLeft}>
                    <ArrowBackIosRoundedIcon fontSize="large"/>
                </IconButton>
                </Fade>

                {
                    images === null ?
                    <Skeleton
                        variant="rect"
                        animation="wave"
                        style={{
                            width: '100%',
                            height: imageHeight + 2*imageBorderWidth,
                            marginTop: indicatorHeight,
                            marginBottom: indicatorHeight
                        }}
                    /> :
                    <Box
                        ref={resizeObserver.ref}
                        className="hideScroll" 
                        style={{
                            flex: 1,
                            overflowY: 'hidden',
                            overflowX: 'auto',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            height: imageHeight + 2*imageBorderWidth + indicatorHeight,
                            marginTop: indicatorHeight
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
                                                onLoadedCallback={onThumbnailLoadedCallback}
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
                    </Box>
                }

                { /* TODO : remove on mobile device */ }
                <Fade in={thumnailScrollActivation.scrollRight}>
                <IconButton onClick={handleThumbnailsScrollRight} disabled={!thumnailScrollActivation.scrollRight}>
                    <ArrowForwardIosRoundedIcon fontSize="large"/>
                </IconButton>
                </Fade>

            </Box>

        </Paper>
    );
}

export default ImageSlider;