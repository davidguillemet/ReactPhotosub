import React, { useState, useRef, useCallback, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Slider from '@material-ui/core/Slider';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import Thumbnail from './thumbnail';

import { resizeEffectHook } from '../../utils/utils';

const thumbnailScollButtonWidth = 50;

const ImageSlider = ({images, currentIndex, onThumbnailClick, style}) => {

    const [thumbSliderValue, setThumbSliderValue] = useState(0);
    const [thumbContainerProps, setThumbContainerProps] = useState({
        width: 0,
        scrollLeft: 0,
        maxScrollLeft: 0
    });
    const [thumnailScrollActivated, setThumbnailScrollActivated] = useState(false);

    const [allThumbnailsLoaded, setAllThumbnailsLoaded] = useState(false);
    const numberOfLoadedThumbnails = useRef(0);

    const getThumbnailRectAt = useCallback((index) => {
        if (!allThumbnailsLoaded) {
            return null;
        }
        const thumbnail = thumbContainerRef.current.children[index];
        return {
            left: thumbnail.offsetLeft - thumbContainerRef.current.offsetLeft,
            width: thumbnail.clientWidth
        };
    }, [allThumbnailsLoaded]);

    const thumbContainerRef = useRef(null);
    const thumbContainerRefCallback = useCallback(element => {
        if (element !== null) {
            thumbContainerRef.current = element;
            setThumbContainerProps(prevState => { return { ...prevState, width: element.clientWidth } });
            const resizeObserver = new ResizeObserver(() => {
                // Mahe sure to synchronize the slider with the effective thumbnail scroll position that can
                // change when resizing the window
                const lastThumbRect = getThumbnailRectAt(thumbContainerRef.current.children.length - 1);
                if (lastThumbRect !== null) {
                    setThumbContainerProps({
                        width: thumbContainerRef.current.clientWidth,
                        scrollLeft: thumbContainerRef.current.scrollLeft,
                        maxScrollLeft: lastThumbRect.left + lastThumbRect.width - thumbContainerRef.current.clientWidth
                    });
                }
            });
            resizeObserver.observe(element);
        }
    }, [getThumbnailRectAt]);
    
    // HandleResize is a callback to be used as dependency in thumbContainerRefCallback
    const handleResize = useCallback(() => {
        // Mahe sure to synchronize the slider with the effective thumbnail scroll position that can
        // change when resizing the window
        const lastThumbRect = getThumbnailRectAt(thumbContainerRef.current.children.length - 1);
        setThumbContainerProps({
            width: thumbContainerRef.current.clientWidth,
            scrollLeft: thumbContainerRef.current.scrollLeft,
            maxScrollLeft: lastThumbRect.left + lastThumbRect.width - thumbContainerRef.current.clientWidth
        });
    }, [getThumbnailRectAt])

    const scrollThumbnailContainer = useCallback((targetScroll) => {
        thumbContainerRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
        setThumbContainerProps(prevState => { return { ...prevState, scrollLeft: targetScroll } });
    }, []);

    const handleThumbnailScroll = useCallback((index) => {

        const thumbnailRect = getThumbnailRectAt(index);

        if (thumbContainerRef === null || thumbContainerRef.current === null || thumbnailRect === null) {
            return;
        }

        const thumbnailLeftVisualPosition = thumbnailRect.left - thumbContainerRef.current.scrollLeft;
        if (thumbnailLeftVisualPosition < 0) {
            scrollThumbnailContainer(thumbnailRect.left);
            return;
        }

        const thumbnailRightVisualPosition = thumbnailLeftVisualPosition + thumbnailRect.width;
        if (thumbnailRightVisualPosition > thumbContainerRef.current.clientWidth) {
            scrollThumbnailContainer(thumbContainerRef.current.scrollLeft + thumbnailRightVisualPosition - thumbContainerRef.current.clientWidth);
            return;
        }
    }, [scrollThumbnailContainer, getThumbnailRectAt]);

    const handleThumbnailClick = useCallback((index) => {
        onThumbnailClick(index);
        handleThumbnailScroll(index);
    }, [handleThumbnailScroll, onThumbnailClick]);

    useEffect(() => {
        // Simulate click handle each time th ecurrent index changes
        if (currentIndex >= 0) {
            handleThumbnailClick(currentIndex);
        }
    }, [currentIndex, handleThumbnailClick]);

    useEffect(() => {

        if (allThumbnailsLoaded === false) {
            return;
        }

        // hide thumbnail slider if not needed
        const lastThumbnailRect = getThumbnailRectAt(thumbContainerRef.current.children.length - 1);
        const lastThumbnailRightPosition = lastThumbnailRect.left + lastThumbnailRect.width;

        if (thumbContainerProps.width === 0 ||
            lastThumbnailRightPosition <= thumbContainerProps.width) {
            setThumbSliderValue(0);
            setThumbnailScrollActivated(false);
            return;
        }
        
        setThumbnailScrollActivated(true);

        let fixedScrollValue = thumbContainerProps.scrollLeft;
        if (fixedScrollValue < 0) {
            fixedScrollValue = 0;
        }
        if (fixedScrollValue > thumbContainerProps.maxScrollLeft) {
            fixedScrollValue = thumbContainerProps.maxScrollLeft;
        }
        const newSliderScrollValue = thumbContainerProps.scrollLeft * 100 / thumbContainerProps.maxScrollLeft;
        setThumbSliderValue(newSliderScrollValue);
    }, [thumbContainerProps, allThumbnailsLoaded, getThumbnailRectAt]);

    useEffect(() => {
        if (allThumbnailsLoaded === false) {
            return;
        }
        handleResize();

    }, [handleResize, allThumbnailsLoaded])

    useEffect(() => {

        if (allThumbnailsLoaded === false) {
            return;
        }

        // hide thumbnail slider if not needed
        const lastThumbnailRect = getThumbnailRectAt(thumbContainerRef.current.children.length - 1);
        const lastThumbnailRightPosition = lastThumbnailRect.left + lastThumbnailRect.width;

        if (thumbContainerProps.width === 0 ||
            lastThumbnailRightPosition <= thumbContainerProps.width) {
            setThumbSliderValue(0);
            setThumbnailScrollActivated(false);
            return;
        }
        
        setThumbnailScrollActivated(true);

        let fixedScrollValue = thumbContainerProps.scrollLeft;
        if (fixedScrollValue < 0) {
            fixedScrollValue = 0;
        }
        if (fixedScrollValue > thumbContainerProps.maxScrollLeft) {
            fixedScrollValue = thumbContainerProps.maxScrollLeft;
        }
        const newSliderScrollValue = thumbContainerProps.scrollLeft * 100 / thumbContainerProps.maxScrollLeft;
        setThumbSliderValue(newSliderScrollValue);
    }, [thumbContainerProps, allThumbnailsLoaded, getThumbnailRectAt]);

    const onThumbnailLoadedCallback = useCallback(() => {
        numberOfLoadedThumbnails.current++;
        if (numberOfLoadedThumbnails.current === images.length) {
            setAllThumbnailsLoaded(true);
        }
    }, [images]);

    resizeEffectHook(thumbContainerRef, handleResize);

    function handleThumbSliderChange(event, newSliderValue) {
        setThumbSliderValue(newSliderValue);
        const scrollValue = newSliderValue * thumbContainerProps.maxScrollLeft / 100;
        scrollThumbnailContainer(scrollValue);
    }

    function handleThumbnailsScrollLeft() {
        thumbContainerRef.current.scrollBy({
            left: -thumbContainerRef.current.clientWidth,
            behavior: 'smooth'
        });
        setThumbContainerProps(prevState => {
            return {
                ...prevState,
                scrollLeft: thumbContainerRef.current.scrollLeft - thumbContainerRef.current.clientWidth
            }
        });
    }

    function handleThumbnailsScrollRight() {
        thumbContainerRef.current.scrollBy({
            left: thumbContainerRef.current.clientWidth,
            behavior: 'smooth'
        });
        setThumbContainerProps(prevState => {
            return {
                ...prevState,
                scrollLeft: thumbContainerRef.current.scrollLeft + thumbContainerRef.current.clientWidth
            }
        });
    }

    return (
        <Paper elevation={4} style={{
            ...style,
            display: 'flex',
            flexDirection: 'column',
        }}>

            <Slider
                value={thumbSliderValue}
                onChange={handleThumbSliderChange}
                disabled={!thumnailScrollActivated}
                style={{
                    marginRight: thumbnailScollButtonWidth+3,
                    marginLeft: thumbnailScollButtonWidth+3,
                    width: 'auto'
                }}
            />

            <Box style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start'
            }}>

                <Box style={{width: thumbnailScollButtonWidth}}>
                    <IconButton onClick={handleThumbnailsScrollLeft} disabled={!thumnailScrollActivated}>
                        <ArrowBackIosRoundedIcon />
                    </IconButton>
                </Box>

                <Box
                    ref={thumbContainerRefCallback}
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        height: 80,
                        marginTop: 0
                    }}
                >
                    {
                        images.map((image, index) => 
                            <Thumbnail
                                key={image.id}
                                image={image}
                                index={index}
                                handleClick={handleThumbnailClick}
                                active={currentIndex === index}
                                onLoadedCallback={onThumbnailLoadedCallback}
                            />
                        )
                    }
                </Box>

                <Box style={{width: thumbnailScollButtonWidth}}>
                    <IconButton onClick={handleThumbnailsScrollRight} disabled={!thumnailScrollActivated}>
                        <ArrowForwardIosRoundedIcon />
                    </IconButton>
                </Box>

            </Box>

        </Paper>
    );
}

export default ImageSlider;