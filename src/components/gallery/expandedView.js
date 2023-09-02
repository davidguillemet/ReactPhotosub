import { makeStyles } from '@mui/styles';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import InfoIcon from '@mui/icons-material/Info';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import AppsIcon from '@mui/icons-material/Apps';
import { useEventListener, getThumbnailSrc } from '../../utils';
import FavoriteButton from './favoriteButton';
import ImageSlider from '../imageSlider';
import ImageInfo from './imageInfo';
import { useResizeObserver } from '../../components/hooks';
import { useScrollBlock, openFullscreen, closeFullscreen } from '../../utils';

import TooltipIconButton from '../../components/tooltipIconButton';
import { HorizontalSpacing } from '../../template/spacing';

import SwipeableViews from 'react-swipeable-views';
import { virtualize } from 'react-swipeable-views-utils';

import {isMobile} from 'react-device-detect';

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

const useStyles = makeStyles({
    navigationButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        color: "#FFFFFF"
    },
    expandedHeader: {
        opacity: 1,
        transition: 'opacity 1s',
        '&.hidden' : {
            opacity: 0
        }
    }
});

const StyleImage = styled('img')(({ theme }) => ({ }));

function StopButtonWithCircularProgress({ onClick, onCompletedRef, duration, size, height}) {
    const [progress, setProgress] = useState(0);

    const timerRef = useRef(null);

    useEffect(() => {
        if (progress === 100) {
            clearInterval(timerRef.current);
            onCompletedRef.current();
        }
    }, [progress, onCompletedRef])

    React.useEffect(() => {
        const progressStep = 2; // step is 2%
        const stepInterval = duration * progressStep / 100;
        // TODO : clear the timer on stop click
        timerRef.current = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress === 100) {
                    return 100;
                }
                const newProgress = prevProgress >= 100 ? 100 : prevProgress + progressStep;
                return newProgress;
            });
        }, stepInterval);
        return () => {
            clearInterval(timerRef.current);
        };
    }, [duration]);

    const handleClick = () => {
        clearInterval(timerRef.current);
        onClick();
    }

    return (
        <TooltipIconButton
            tooltip={"Arrêter le diaporama"}
            onClick={handleClick}
            size={size}
        >
            <StopIcon fontSize='inherit'></StopIcon>
            <CircularProgress
                variant="determinate"
                value={progress}
                style={{
                    position: "absolute",
                    margin: 'auto'
                }}
                size={height-4}
                thickness={5}
            />
        </TooltipIconButton>
    );
}

const getSlideSrc = (image, availableWidth, availableHeight) => {
    if (availableWidth === 0 || availableHeight === null) {
        return null;
    }
    return getThumbnailSrc(image, availableWidth, availableHeight);
}

const SlideRenderer = ({image, containerWidth, containerHeight}) => {

    const slideSrc = useMemo(() => getSlideSrc(image, containerWidth, containerHeight), [image, containerWidth, containerHeight]);

    function onImageLoaded(event) {
        event.target.classList.add('loaded');
    }

    return (
        <StyleImage
            alt=""
            onLoad={onImageLoaded}
            src={slideSrc}
            sx={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                opacity: 0,
                transition: 'opacity 1s',
                '&.loaded': {
                    opacity: 1
                },
                objectFit: 'contain' // Prevent portrait image being enlarged on chrome windows (at least)
            }}
        />
    );
}

const ExpandedView = React.forwardRef(({
    images,
    count,
    index,
    onChangeIndex = null,
    onClose,
    displayDestination = true ,
    hasNext = false,
    onNextPage = null}, ref) => {

    const [currentIndex, setCurrentIndex] = useState(index);
    const [infoVisible, setInfoVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const headerBarRef = useRef(null);
    const hideHeaderTimeout = useRef(null);
    const handleNextImageRef = useRef(null);

    const waitingForNextPage = useRef(false);

    const slideContainerResizeObserver = useResizeObserver();
    const [blockScroll, allowScroll] = useScrollBlock();

    const classes = useStyles();

    useEventListener('keydown', handleKeyDown);

    const currentImage = useMemo(() => images[currentIndex], [images, currentIndex]);

    // Deactivate scroll on expanded view
    useEffect(() => {
        blockScroll();
        return () => {
            allowScroll();
        }
    }, [allowScroll, blockScroll]);

    // Make sure to clear the timeout on unmount
    useEffect(() => {
        return () => clearTimeout(hideHeaderTimeout.current);
    }, []);

    useEffect(() => {
        if (waitingForNextPage.current === true) {
            waitingForNextPage.current = false;
            setCurrentIndex(index => index + 1);
        }
    }, [images])

    // Required to update image for backward/forward
    useEffect(() => {
        setCurrentIndex(index);
    }, [index]);

    const handleThumbnailClick = useCallback((index) => {
        setCurrentIndex(index);
        if (onChangeIndex) {
            onChangeIndex(index);
        }
    }, [onChangeIndex]);

    const hideHeaderBar = useCallback(() => {
        headerBarRef.current.classList.add('hidden');
    }, []);

    const handleMouseMove = useCallback(() => {
        headerBarRef.current.classList.remove('hidden');
        clearTimeout(hideHeaderTimeout.current);
        hideHeaderTimeout.current = setTimeout(hideHeaderBar, 3000);
    }, [hideHeaderBar]);

    const toolbarIconSize = isMobile ? 'small' : 'medium';
    const playable = count > 1;

    function handleKeyDown(event) {
        switch (event.code) { // or event.key or event.keyCode as integer
            case "ArrowLeft":
                handlePreviousImage();
                break;
            case "ArrowRight":
                handleNextImage();
                break;
            case "Space":
                if (playable === false) {
                    break;
                }
                if (isPlaying) {
                    handleStopClick();
                } else {
                    handlePlayClick();
                }
                break;
            case "Escape":
                if (isPlaying) {
                    handleStopClick();
                } else if (fullScreen) {
                    handleClickExitFullScreen();
                } else {
                    handleCloseClick();
                }
                break;
            default:
                break;
        }
    }

    const cancelHideHeaderBar = useCallback(() => {
        headerBarRef.current.classList.remove('hidden');
        clearTimeout(hideHeaderTimeout.current);
    }, []);

    const handleClickFullScreen = useCallback(() => {
        setFullScreen(true);
        openFullscreen();
    }, []);

    const handleClickExitFullScreen = useCallback(() => {
        cancelHideHeaderBar();
        setFullScreen(false);
        closeFullscreen();
    }, [cancelHideHeaderBar]);

    const handleClickToggleThumbnails = useCallback(() => {
        setShowThumbnails(visible => !visible);
    }, []);

    const handlePlayClick = useCallback(() => {
        handleMouseMove();
        setIsPlaying(true);
    }, [handleMouseMove]);

    const handleStopClick = useCallback(() => {
        cancelHideHeaderBar();
        setIsPlaying(false);
    }, [cancelHideHeaderBar]);

    const handleInfoClick = useCallback(() => {
        setInfoVisible(prevInfoVisible => !prevInfoVisible);
    }, []);

    const handleCloseClick = useCallback(() => {
        closeFullscreen();
        onClose();
    }, [onClose]);

    const handlePreviousImage = () => {
        if (currentIndex > 0) {
            handleThumbnailClick(currentIndex - 1);
        }
    }

    const handleNextImage = () => {
        if (currentIndex < images.length - 1) {
            handleThumbnailClick(currentIndex + 1);
        } else if (currentIndex < count - 1 && hasNext && onNextPage) {
            waitingForNextPage.current = true;
            onNextPage();
        }
    }

    // To avoid useless StopButtonWithCircularProgress rerendering
    handleNextImageRef.current = handleNextImage;

    const slideRenderer = (params) => {
        const {index} = params;
        const image = images[index];

        return (
            <SlideRenderer
                key={image.id}
                image={image}
                containerWidth={slideContainerResizeObserver.width}
                containerHeight={slideContainerResizeObserver.height}
            />
        );
    };

    const floatingHeader = (isPlaying || fullScreen);

    return (
        <Box
            onMouseMove={floatingHeader ? handleMouseMove : null}
            sx={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                width: '100%',
                height: '100%',
                padding: 0,
                backgroundColor: theme => theme.palette.grey['900']
            }}
        >
            { /* HEADER TOOLBAR */}
            <Paper
                elevation={4}
                ref={headerBarRef}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    transition: 'opacity 1s',
                    opacity: 1,
                    '&.hidden' : {
                        opacity: 0
                    },
                    width: floatingHeader ? "auto" : "100%",
                    position: floatingHeader ? "absolute" : "relative",
                    zIndex: floatingHeader ? 100 : 1,
                    ...(floatingHeader && {
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }),
                    ...(isMobile && {
                        padding: 0.5
                    })
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                    }}
                >
                    {
                        isPlaying ?
                            <StopButtonWithCircularProgress
                                onClick={handleStopClick}
                                onCompletedRef={handleNextImageRef}
                                duration={5000}
                                key={currentImage.id}
                                size={toolbarIconSize}
                                height={headerBarRef.current.offsetHeight}
                            /> :
                            <TooltipIconButton
                                tooltip="Lancer le diaporama"
                                onClick={handlePlayClick}
                                disabled={playable === false}
                                size={toolbarIconSize}
                            >
                                <PlayArrowIcon fontSize="inherit"></PlayArrowIcon>
                            </TooltipIconButton>
                    }

                    <React.Fragment>
                        <TooltipIconButton
                            tooltip={infoVisible ? "Cacher les détails" : "Afficher les détails"}
                            onClick={handleInfoClick}
                            size={toolbarIconSize}
                        >
                            {
                                infoVisible ?
                                <InfoIcon fontSize="inherit"></InfoIcon> :
                                <InfoOutlined fontSize="inherit"></InfoOutlined>
                            }
                        </TooltipIconButton>
                        <FavoriteButton size={toolbarIconSize} image={currentImage} />
                        <TooltipIconButton
                            tooltip={fullScreen ? "Réduire" : "Plein écran"}
                            onClick={fullScreen ? handleClickExitFullScreen : handleClickFullScreen}
                            size={toolbarIconSize}
                        >
                        {   
                            fullScreen ?
                            <FullscreenExitIcon fontSize="inherit" /> :
                            <FullscreenIcon fontSize="inherit" />
                        }
                        </TooltipIconButton>
                        <TooltipIconButton
                            tooltip={showThumbnails ? "Masquer les vignettes" : "Afficher les vignettes"}
                            onClick={handleClickToggleThumbnails}
                            size={toolbarIconSize}
                        >
                            <AppsIcon fontSize="inherit" />
                        </TooltipIconButton>
                    </React.Fragment>

                </Box>
                <Box
                    style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Chip label={`${currentIndex + 1} / ${count}`} />
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }}
                >
                    {
                        isPlaying ?
                        <HorizontalSpacing></HorizontalSpacing> :
                        <TooltipIconButton
                            tooltip="Fermer la visionneuse"
                            onClick={handleCloseClick}
                            size={toolbarIconSize}
                        >
                            <CloseIcon fontSize="inherit"></CloseIcon>
                        </TooltipIconButton>
                    }
                </Box>
            </Paper>
            
            { /* IMAGE BOX WITH NAVIGATION BUTTONS */}
            <Box
                ref={slideContainerResizeObserver.ref}
                sx={{
                    position: 'relative',
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    overflow: 'hidden',
                }}
            >
                <VirtualizeSwipeableViews
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                    containerStyle={{
                        height: '100%'
                    }}
                    slideStyle={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        padding: 0,
                        overflow: 'hidden'
                    }}
                    index={currentIndex}
                    onChangeIndex={handleThumbnailClick}
                    slideRenderer={slideRenderer}
                    slideCount={images.length}
                />

                <ImageInfo
                    container={slideContainerResizeObserver.element}
                    style={{
                        mb: fullScreen ? 1 : 0
                    }}
                    image={currentImage}
                    displayDestination={displayDestination}
                    visible={infoVisible}
                />

                {
                    !isMobile && 
                    <Collapse in={!isPlaying}>
                        <IconButton
                            className={classes.navigationButton}
                            disabled={currentIndex === 0}
                            onClick={handlePreviousImage}
                            style={{
                                left: 10
                            }}
                            size="large"
                        >
                            <ArrowBackIosRoundedIcon fontSize='large' />
                        </IconButton>
                    </Collapse>
                }

                { /* if mobile, show the button if it's the last of the current page */
                    (!isMobile || (currentIndex === images.length - 1 && images.length < count)) &&
                    <Collapse in={!isPlaying}>
                        <IconButton
                            className={classes.navigationButton}
                            disabled={currentIndex === count - 1}
                            onClick={handleNextImage}
                            style={{
                                right: 10
                            }}
                            size="large"
                        >
                            <ArrowForwardIosRoundedIcon fontSize='large' />
                        </IconButton>
                    </Collapse>
                }

                { /* OVerlay when waiting for the next page */ }
                <Dialog
                    open={waitingForNextPage.current}
                    PaperProps={{
                        sx: {
                            backgroundColor: 'transparent',
                            textAlign: 'center',
                            overflow: 'hidden',
                            boxShadow: 'unset'
                        }
                    }}
                >
                    <CircularProgress thickness={5} size={60}/>
                </Dialog>

            </Box>

            <Collapse in={showThumbnails}>
                <Paper sx={{
                        py: 1,
                    }}
                >
                <ImageSlider
                    images={images}
                    currentIndex={currentIndex}
                    onThumbnailClick={handleThumbnailClick}
                    hasNext={hasNext}
                    onNextPage={onNextPage}
                />
                </Paper>
            </Collapse>
        </Box>
    );
});

export default ExpandedView;