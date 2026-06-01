import React, { useEffect, useState, useRef, useCallback } from 'react';
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

import { useScrollBlock, isLandscape } from 'utils';
import { useAppContext } from 'template/app/appContext';
import { useFocusManager, useResizeObserver } from 'components/hooks';
import { ReactRouterAwaiter } from 'components/reactRouter';
import MainImage from './MainImage';
import { DetailsProvider } from './useDetailsState';

const _diaporamaInterval = 15000;
const _transitionDuration = 2000;

const filterLandscapeImages = (images) => {
    return images.filter(isLandscape);
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

    const landscapeImages = React.useMemo(() => filterLandscapeImages(images), [images]);

    useEffect(() => {
        const playing = !drawerOpen && !searchOpen && onFocus && landscapeImages !== null && landscapeImages.length > 1;
        setIsPlaying(playing);
    }, [drawerOpen, searchOpen, onFocus, landscapeImages]);

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
            return newIndex >= 0 ? newIndex : (landscapeImages.length - 1);
        });
    }, [landscapeImages]);

    const stopSlideshow = useCallback(() => {
        if (typeof diaporamaTimeoutRef.current === 'number') {
            clearTimeout(diaporamaTimeoutRef.current);
        }
    }, []);

    const handleImageLoaded = useCallback(() => {
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
        <DetailsProvider>
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
                            images={landscapeImages}
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
                zIndex: (theme) => theme.zIndex.appBar + 1
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
                    spacing={2}
                    sx={{
                        alignItems: "center",
                        justifyContent: "center",
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
        </DetailsProvider>
    );
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
