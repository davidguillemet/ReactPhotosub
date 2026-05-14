import React, { useEffect, useState, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles.css';

import { useLoaderData } from "react-router";

import { getThumbnailSrc, useImageKit } from 'utils';
import { useScrollBlock } from 'utils';
import { useAppContext } from 'template/app/appContext';
import { useFocusManager, useResizeObserver } from 'components/hooks';
import { ReactRouterAwaiter } from 'components/reactRouter';

const _diaporamaInterval = 15000;
const _transitionDuration = 2000;

const MainImageStyled = styled('img')({
    display: 'block',
    minHeight: '100%',
    minWidth : '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'cover' // prevent image from shrinking when window width is too small
});

const _imageSizeRatio = 600 / 400; // always landscape

const _defaultImageSrc = useImageKit ?
    "photosub.appspot.com/home/DSC_0706-Modifier.jpg" :
    "/home_initial.jpg";

const MainImage = ({images, currentImageIndex, handleImageLoaded, width, height}) => {

    // If the height is less than the image height which width is the available width, all is ok
    // -> get the thumbnail with the same width as the available width
    const availableWidth = width;
    const availableHeight = height;

    let thumbnailWidth = availableWidth;
    const thumbnailHeight = thumbnailWidth / _imageSizeRatio;
    if (thumbnailHeight < availableHeight) {
        // Consider the image height and calculate the new thumbnail width
        thumbnailWidth = availableHeight * _imageSizeRatio;
    }

    let originalImageSrc;

    if (images !== null && currentImageIndex >= 0) {
        const currentImage = images[currentImageIndex % images.length];
        originalImageSrc = currentImage.src;
    } else {
        originalImageSrc = _defaultImageSrc;
    }

    const currentImageSrc = React.useMemo(() => getThumbnailSrc({
        src: originalImageSrc,
        sizeRatio: _imageSizeRatio
    }, thumbnailWidth), [originalImageSrc, thumbnailWidth]);

    return (
        <MainImageStyled 
            alt=""
            onLoad={handleImageLoaded}
            src={currentImageSrc}
        />
    )
};

const Home = ({images, currentIndex}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
    const [blockScroll, allowScroll] = useScrollBlock();
    const diaporamaTimeoutRef = useRef(null);
    const { drawerOpen, searchOpen} = useAppContext();
    const resizeObserver = useResizeObserver();
    const boxRef = React.createRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const { focus: onFocus } = useFocusManager();

    useEffect(() => {
        const playing = !drawerOpen && !searchOpen && onFocus && images !== null && images.length > 1;
        setIsPlaying(playing);
    }, [drawerOpen, searchOpen, onFocus, images]);

    useEffect(() => {
        blockScroll();
        return () => {
            allowScroll();
        }
    }, [blockScroll, allowScroll]);

    useEffect(() => {
        return () => {
            clearTimeout(diaporamaTimeoutRef.current);
        }
    }, []);

    const handleNextImage = useCallback(() => {
        setCurrentImageIndex(prevIndex => prevIndex + 1);
    }, []);

    const handlePreviousImage = useCallback(() => {
        setCurrentImageIndex(prevIndex => {
            const newIndex = prevIndex - 1;
            return newIndex >= 0 ? newIndex : (images.length - 1);
        });
    }, [images]);

    const stopSlideshow = useCallback(() => {
        if (typeof diaporamaTimeoutRef.current === 'number') {
            clearTimeout(diaporamaTimeoutRef.current);
        }
    }, []);

    const handleImageLoaded = useCallback((event) => {
        if (isPlaying) {
            clearTimeout(diaporamaTimeoutRef.current);
            diaporamaTimeoutRef.current = setTimeout(handleNextImage, _diaporamaInterval);
        }
    }, [handleNextImage, isPlaying]);

    const resumeSlideshow = useCallback(() => {
        handleImageLoaded();
    }, [handleImageLoaded]);

    const togglePlay = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            // play slideshow
            resumeSlideshow();
        } else {
            // Stop slideshow
            stopSlideshow();
        }
    }, [isPlaying, stopSlideshow, resumeSlideshow]);

    return (
        <Box
            ref={resizeObserver.ref}
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                padding: 0,
                overflow: 'hidden'
            }}
        >
            <TransitionGroup component={null}>
                <CSSTransition
                    key={currentImageIndex}
                    nodeRef={boxRef}
                    timeout={_transitionDuration}
                    classNames="slide"
                >
                    <Box
                        ref={boxRef}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            padding: 0,
                            overflow: 'hidden'
                        }}
                    >
                        <MainImage
                            images={images}
                            currentImageIndex={currentImageIndex}
                            handleImageLoaded={handleImageLoaded}
                            width={resizeObserver.width}
                            height={resizeObserver.height}
                        />
                    </Box>
                </CSSTransition>
            </TransitionGroup>
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
            }}>
                <Box
                    key={`${currentImageIndex}-${isPlaying}`}
                    sx={{
                        height: '100%',
                        width: isPlaying ? '100%' : '0px',
                        backgroundColor: theme => theme.palette.primary.main,
                        transformOrigin: 'left',
                        animation: isPlaying
                            /* see key-frames in style.css */
                            ? `diaporama-progress ${_diaporamaInterval}ms linear forwards`
                            : 'none',
                    }}
                />
            </Box>
            <Box sx={{
                position: 'absolute',
                transform: 'translateY(-50%)',
                top: '50%',
                right: 0,
                padding: 1,
            }}>
                <Stack
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                    sx={{
                        opacity: 0.5,
                        '&:hover': {
                            opacity: 0.8,
                        }
                    }}
                >
                    <IconButton
                        onClick={togglePlay}
                    >
                        {
                            isPlaying ? <PauseIcon /> : <PlayArrowIcon />
                        }
                    </IconButton>
                    <IconButton
                        onClick={handleNextImage}
                    >
                        <ArrowUpwardIcon />
                    </IconButton>
                    <IconButton
                        onClick={handlePreviousImage}
                    >
                        <ArrowDownwardIcon />
                    </IconButton>
                </Stack>
            </Box>
        </Box>
    )
}
    
const HomeController = () => {
    const { images } = useLoaderData();
    return (
        <ReactRouterAwaiter
            value={images} 
        >
            {images => <Home images={images} currentIndex={0} />}
        </ReactRouterAwaiter>
    )
}

export default HomeController;
export const Component = HomeController;
