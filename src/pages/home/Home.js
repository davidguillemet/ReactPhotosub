import React, { useEffect, useState, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles.css';

import { uniqueID, shuffleArray, getThumbnailSrc, useImageKit } from 'utils';
import { useQueryContext } from 'components/queryContext';
import { useScrollBlock } from 'utils';
import { useAppContext } from 'template/app/appContext';
import { useFocusManager, useResizeObserver } from 'components/hooks';

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

const MainImage = ({images, currentImageIndex, handleImageLoaded, width, height}) => {

    let defaultImageSrc = useImageKit ?
        "photosub.appspot.com/home/DSC_0706-Modifier.jpg" :
        "/home_initial.jpg";

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
        originalImageSrc = defaultImageSrc;
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
    const [initialTimeoutCompleted, setInitialTimeoutCompleted] = useState(false);
    const [blockScroll, allowScroll] = useScrollBlock();
    const diaporamaTimeoutRef = useRef(null);
    const initialTimeoutRef = useRef(null);
    const { drawerOpen } = useAppContext();
    const resizeObserver = useResizeObserver();
    const boxRef = React.createRef(null);

    const { focus: onFocus } = useFocusManager();

    const isPlaying = !drawerOpen && onFocus;

    useEffect(() => {
        blockScroll();
        return () => {
            allowScroll();
        }
    }, [blockScroll, allowScroll]);

    useEffect(() => {
        // Just create a first timeout to display the first image a few seconds...
        initialTimeoutRef.current = setTimeout(() => {
            setInitialTimeoutCompleted(true);
        }, 5000);
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(initialTimeoutRef.current);
            clearTimeout(diaporamaTimeoutRef.current);
        }
    }, []);

    useEffect(() => {
        // Just display the next image when all images are loaded and the first one
        // has been displayed a few seconds
        if (images !== null && initialTimeoutCompleted === true) {
            setCurrentImageIndex(prevIndex => prevIndex + 1);
        }
    }, [images, initialTimeoutCompleted]);

    const handleNextImage = useCallback(() => {
        if (images === null) {
            return;
        }
        diaporamaTimeoutRef.current = null;
        setCurrentImageIndex(prevIndex => prevIndex + 1);
    }, [images]);

    const nextImage = useCallback(() => {
        if (initialTimeoutCompleted === true) {
            clearTimeout(diaporamaTimeoutRef.current);
            diaporamaTimeoutRef.current = setTimeout(handleNextImage, _diaporamaInterval);
        }
    }, [handleNextImage, initialTimeoutCompleted]);

    const stopSlideshow = useCallback(() => {
        if (typeof initialTimeoutRef.current === 'number') {
            clearTimeout(initialTimeoutRef.current);
        }
        if (typeof diaporamaTimeoutRef.current === 'number') {
            clearTimeout(diaporamaTimeoutRef.current);
        }
    }, []);

    const resumeSlideshow = useCallback(() => {
        nextImage();
    }, [nextImage]);

    const handleImageLoaded = useCallback((event) => {
        if (isPlaying) {
            nextImage();
        }
    }, [nextImage, isPlaying]);

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
        </Box>
    )
};

const HomeController = () => {
    const queryContext = useQueryContext();
    const [images, setImages] = useState(null);
    const { data } = queryContext.useFetchHomeSlideshow();
    useEffect(() => {
        if (data === undefined) {
            return;
        }
        setImages(shuffleArray(data).map(image => {
            return {
                ...image,
                ...(process.env.REACT_APP_USE_FUNCTIONS_EMULATOR === 'true' && {
                    src: image.src.replace("127.0.0.1", process.env.REACT_APP_DEV_HOST)
                }),
                id: uniqueID()
            }
        }));
    }, [data]);

    return (
        <Home images={images} currentIndex={-1} />
    )
}

export default HomeController;