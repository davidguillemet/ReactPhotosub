import { makeStyles } from '@mui/styles';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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
import { useEventListener, getThumbnailSrc } from '../../utils';
import FavoriteButton from './favoriteButton';
import ImageSlider from '../imageSlider';
import ImageInfo from './imageInfo';
import { useResizeObserver } from '../../components/hooks';

import TooltipIconButton from '../../components/tooltipIconButton';
import { HorizontalSpacing } from '../../template/spacing';

import SwipeableViews from 'react-swipeable-views';
import { virtualize } from 'react-swipeable-views-utils';

import {isMobile} from 'react-device-detect';

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

const useStyles = makeStyles({
    navigationButton: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)'
    },
    mainImage: {
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

function StopButtonWithCircularProgress({ onClick, onCompleted, duration }) {
    const [progress, setProgress] = useState(0);

    const timerRef = useRef(null);

    React.useEffect(() => {
        const progressStep = 5; // step is 5%
        const stepInterval = duration * 5 / 100;
        // TODO : clear the timer on stop click
        timerRef.current = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress === 100) {
                    onCompleted();
                    return 100;
                }
                const newProgress = prevProgress >= 100 ? 100 : prevProgress + progressStep;
                return newProgress;
            });
        }, stepInterval);
        return () => {
            clearInterval(timerRef.current);
        };
    }, [duration, onCompleted]);

    const handleClick = () => {
        clearInterval(timerRef.current);
        onClick();
    }

    return (
        <TooltipIconButton
            tooltip={"Arrêter le diaporama"}
            onClick={handleClick}
        >
            <StopIcon fontSize='large'></StopIcon>
            <CircularProgress variant="determinate" value={progress} style={{
                position: "absolute",
                margin: 'auto'
                }}
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

const SlideRenderer = ({image}) => {

    const resizeObserver = useResizeObserver();

    const slideSrc = useMemo(() => getSlideSrc(image, resizeObserver.width, resizeObserver.height), [image, resizeObserver.width, resizeObserver.height]);

    function onImageLoaded(event) {
        event.target.classList.add('loaded');
    }

    return (
        <Box
            ref={resizeObserver.ref}
            key={image.id}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                padding: 0,
                overflow: 'hidden'
        }}>
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
        </Box>
    );
}

const ExpandedView = React.forwardRef(({ images, index, onClose, displayDestination = true }, ref) => {

    const [currentIndex, setCurrentIndex] = useState(index);
    const [infoVisible, setInfoVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);
    const headerBarRef = useRef(null);
    const hideHeaderTimeout = useRef(null);
          
    const classes = useStyles();

    useEventListener('keydown', handleKeyDown);

    const currentImage = useMemo(() => images[currentIndex], [images, currentIndex]);

    // Make sure to clear the timeout on unmount
    useEffect(() => {
        if (!isPlaying) {
            clearTimeout(hideHeaderTimeout.current);
        }
        return () => clearTimeout(hideHeaderTimeout.current);
    }, [isPlaying]);

    useEffect(() => {
        setCurrentIndex(index);
    }, [index, images])

    function handleMouseMove() {
        headerBarRef.current.classList.remove('hidden');
        clearTimeout(hideHeaderTimeout.current);
        hideHeaderTimeout.current = setTimeout(hideHeaderBar, 3000);
    }

    function hideHeaderBar() {
        headerBarRef.current.classList.add('hidden');
    }

    function handleKeyDown(event) {
        switch (event.code) { // or event.key or event.keyCode as integer
            case "ArrowLeft":
                handlePreviousImage();
                break;
            case "ArrowRight":
                handleNextImage();
                break;
            case "Space":
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

    function cancelHideHeaderBar() {
        headerBarRef.current.classList.remove('hidden');
        clearTimeout(hideHeaderTimeout.current);
    }

    function handleClickFullScreen() {
        hideHeaderBar();
        setFullScreen(true);
    }

    function handleClickExitFullScreen() {
        cancelHideHeaderBar();
        setFullScreen(false);
    }

    function handlePlayClick() {
        hideHeaderBar();
        setInfoVisible(false);
        setIsPlaying(true);
    }

    function handleStopClick() {
        cancelHideHeaderBar();
        setIsPlaying(false);
    }

    function handleInfoClick() {
        setInfoVisible(!infoVisible);
    }

    function handleCloseClick() {
        onClose();
    }

    function handlePreviousImage() {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        setCurrentIndex(newIndex);
    }

    function handleNextImage() {
        const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
    }

    const toolbarIconSize = isMobile ? 'medium' : 'large';

    const slideRenderer = (params) => {
        const {index} = params;

        let image = null;
        const modulo = index % images.length;
        if (index >= 0) {
            image = images[modulo];
        } else {
            image = images[images.length + modulo]; // modulo is less than 0
        }

        return (
            <SlideRenderer key={image.id} image={image} />
        );
    };

    return (
        <Box
            onMouseMove={(isPlaying || fullScreen) ? handleMouseMove : null}
            style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                width: '100%',
                height: '100%',
                padding: 0
            }}
        >
            { /* HEADER TOOLBAR */}
            <Paper
                elevation={4}
                ref={headerBarRef}
                className={classes.expandedHeader}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    transition: 'opacity 1s',
                    width: (isPlaying || fullScreen) ? "auto" : "100%",
                    position: (isPlaying || fullScreen) ? "absolute" : "relative",
                    zIndex: (isPlaying || fullScreen) ? 100 : 1,
                    ...((isPlaying || fullScreen) && {
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)'
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
                            <StopButtonWithCircularProgress onClick={handleStopClick} onCompleted={handleNextImage} duration={5000} key={currentImage.id}/> :
                            <TooltipIconButton
                                tooltip="Lancer le diaporama"
                                onClick={handlePlayClick}
                            >
                                <PlayArrowIcon fontSize={toolbarIconSize}></PlayArrowIcon>
                            </TooltipIconButton>
                    }
                    {
                        isPlaying ?
                        null :
                        <React.Fragment>
                            <TooltipIconButton
                                tooltip={infoVisible ? "Cacher les détails" : "Afficher les détails"}
                                onClick={handleInfoClick}
                            >
                                {
                                    infoVisible ?
                                    <InfoIcon fontSize={toolbarIconSize}></InfoIcon> :
                                    <InfoOutlined fontSize={toolbarIconSize}></InfoOutlined>
                                }
                            </TooltipIconButton>
                            <FavoriteButton fontSize={toolbarIconSize} image={currentImage} />
                            <TooltipIconButton
                                tooltip={fullScreen ? "Réduire" : "Plein écran"}
                                onClick={fullScreen ? handleClickExitFullScreen : handleClickFullScreen}
                            >
                            {   
                                fullScreen ?
                                <FullscreenExitIcon fontSize={toolbarIconSize} /> :
                                <FullscreenIcon fontSize={toolbarIconSize} />
                            }
                            </TooltipIconButton>
                        </React.Fragment>
                    }
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
                    <Chip label={`${currentIndex + 1} / ${images.length}`} />
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
                            onClick={handleCloseClick}>
                            <CloseIcon fontSize={toolbarIconSize}></CloseIcon>
                        </TooltipIconButton>
                    }
                </Box>
            </Paper>
            
            { /* IMAGE BOX WITH NAVIGATION BUTTONS */}
            <Box
                style={{
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
                    index={currentIndex}
                    onChangeIndex={setCurrentIndex}
                    slideRenderer={slideRenderer}
                    slideCount={images.length}
                />


                { !isMobile && 
                <Collapse in={!isPlaying}>
                    <IconButton
                        className={classes.navigationButton}
                        onClick={handlePreviousImage}
                        style={{
                            left: 10
                        }}
                        size="large">
                        <ArrowBackIosRoundedIcon fontSize='large' />
                    </IconButton>
                    <IconButton
                        className={classes.navigationButton}
                        onClick={handleNextImage}
                        style={{
                            right: 10
                        }}
                        size="large">
                        <ArrowForwardIosRoundedIcon fontSize='large' />
                    </IconButton>
                </Collapse>
                }

            </Box>

            <Collapse in={infoVisible}>
                <ImageInfo
                    style={{
                        mb: fullScreen ? 1 : 0
                    }}
                    image={currentImage}
                    displayDestination={displayDestination}
                />
            </Collapse>

            <Collapse in={!isPlaying && !fullScreen}>
                <ImageSlider
                    style={{
                        my: 1,
                    }}
                    images={images}
                    currentIndex={currentIndex}
                    onThumbnailClick={setCurrentIndex}
                />
            </Collapse>
        </Box>
    );
});

export default ExpandedView;