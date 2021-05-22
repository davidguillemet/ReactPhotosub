import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState, useRef } from 'react';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import StopIcon from '@material-ui/icons/Stop';
import CloseIcon from '@material-ui/icons/CloseOutlined';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import Typography from '@material-ui/core/Typography';
import { useEventListener } from '../../utils/utils';
import FavoriteButton from './favoriteButton';
import ImageSlider from '../imageSlider';

import TooltipIconButton from '../../components/tooltipIconButton';
import { HorizontalSpacing } from '../../template/spacing';

import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles.css';

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
        }
    },
    detailsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        opacity: 0,
        backgroundColor: 'rgba(255,255,255,0.6)',
        display: 'flex',
        transition: 'all 500ms',
        '&.active': {
            backgroundColor: 'rgba(255,255,255,0.6)',
            opacity: 1
        }
    },
    expandedHeader: {
        opacity: 1,
        transition: 'opacity 1s',
        '&.hidden' : {
            opacity: 0
        }
    }
});

function StopButtonWithCircularProgress({ onClick, onCompleted, duration }) {
    const [progress, setProgress] = useState(0);

    React.useEffect(() => {
        const progressStep = 5; // step is 5%
        const stepInterval = duration * 5 / 100;
        const timer = setInterval(() => {
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
            clearInterval(timer);
        };
    }, [duration, onCompleted]);

    return (
        <TooltipIconButton
            tooltip={"Arrêter le diaporama"}
            onClick={onClick}
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

const ExpandedView = ({ images, currentId, onClose }) => {

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [currentImage, setCurrentImage] = useState(null);
    const [infoVisible, setInfoVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);
    const headerBarRef = useRef(null);
    const hideHeaderTimeout = useRef(null);
          
    const classes = useStyles();

    useEventListener('keydown', handleKeyDown);

    // Make sure to clear the timeout on unmount
    useEffect(() => {
        if (!isPlaying) {
            clearTimeout(hideHeaderTimeout.current);
        }
        return () => clearTimeout(hideHeaderTimeout.current);
    }, [isPlaying]);

    useEffect(() => {
        const currentImageIndex = images.findIndex(image => image.id === currentId);
        setCurrentIndex(currentImageIndex);
    }, [currentId, images])

    useEffect(() => {
        if (currentIndex >= 0) {
            const currentImage = images[currentIndex];
            setCurrentImage(currentImage);
        }
    }, [currentIndex, images]);

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

    function onImageLoaded(event) {
        event.target.classList.add('loaded');
    }

    function currentImageHasDetails() {
        if (currentImage === null) {
            return false;
        }
        return currentImage.title.length > 0 || currentImage.description.length > 0
    }

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
                padding: 10
            }}
        >
            <Paper
                elevation={4}
                ref={headerBarRef}
                className={classes.expandedHeader}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    transition: 'opacity 1s',
                    width: (isPlaying || fullScreen) ? "auto" : "100%",
                    position: (isPlaying || fullScreen) ? "absolute" : "relative",
                    zIndex: (isPlaying || fullScreen) ? 100 : 1 
                }}
            >
                <Box style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center'
                }}
                >
                    {
                        isPlaying ?
                            <StopButtonWithCircularProgress onClick={handleStopClick} onCompleted={handleNextImage} duration={5000} key={currentImage?.id}/> :
                            <TooltipIconButton
                                tooltip="Lancer le diaporama"
                                onClick={handlePlayClick}
                            >
                                <PlayArrowIcon fontSize='large'></PlayArrowIcon>
                            </TooltipIconButton>
                    }
                    {
                        isPlaying ?
                        null :
                        <React.Fragment>
                            <TooltipIconButton
                                tooltip={infoVisible ? "Cacher les détails" : "Afficher les détails"}
                                onClick={handleInfoClick}
                                disabled={currentImageHasDetails() === false}
                            >
                                <InfoIcon fontSize='large'></InfoIcon>
                            </TooltipIconButton>
                            <FavoriteButton fontSize='large' path={`${currentImage?.path}/${currentImage?.name}`} />
                            <TooltipIconButton
                                tooltip={fullScreen ? "Réduire" : "Plein écran"}
                                onClick={fullScreen ? handleClickExitFullScreen : handleClickFullScreen}
                            >
                            {   
                                fullScreen ?
                                <FullscreenExitIcon fontSize='large' /> :
                                <FullscreenIcon fontSize='large' />
                            }
                            </TooltipIconButton>
                        </React.Fragment>
                    }
                </Box>
                <Box style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                >
                    <Chip label={`${currentIndex + 1} / ${images.length}`} />
                </Box>
                <Box style={{
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
                            <CloseIcon fontSize='large'></CloseIcon>
                        </TooltipIconButton>
                    }
                </Box>
            </Paper>
            <Box style={{
                position: 'relative',
                display: 'flex',
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                overflow: 'hidden'
            }}
            >
                <TransitionGroup component={null}>
                    <CSSTransition
                        key={currentImage?.id}
                        timeout={500}
                        classNames="slide"
                    >
                        <Box
                            key={currentImage?.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                padding: 10,
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                alt=""
                                onLoad={onImageLoaded}
                                src={currentImage?.src}
                                className={classes.mainImage} />
                        </Box>
                    </CSSTransition>
                </TransitionGroup>

                <Collapse in={!isPlaying}>
                    <IconButton
                        className={classes.navigationButton}
                        onClick={handlePreviousImage}
                        style={{
                            left: 10
                        }}>
                        <ArrowBackIosRoundedIcon fontSize='large' />
                    </IconButton>
                    <IconButton
                        className={classes.navigationButton}
                        onClick={handleNextImage}
                        style={{
                            right: 10
                        }}>
                        <ArrowForwardIosRoundedIcon fontSize='large' />
                    </IconButton>
                </Collapse>
            </Box>

            <Collapse in={infoVisible && currentImageHasDetails()}>
                <Paper elevation={4} style={{
                    marginBottom: 5,
                    padding: 10,
                    textAlign: 'center',
                    backgroundColor: '#edfeff'
                }}>
                    <Typography variant="h4" style={{ margin: 0 }}>{currentImage?.title}</Typography>
                    <Typography variant="h5" style={{ marginBottom: 0 }}>{currentImage?.description}</Typography>
                </Paper>
            </Collapse>

            <Collapse in={!isPlaying && !fullScreen}>
                <ImageSlider
                    images={images}
                    currentIndex={currentIndex}
                    onThumbnailClick={setCurrentIndex}
                />
            </Collapse>
        </Box>
    );
};

export default ExpandedView;