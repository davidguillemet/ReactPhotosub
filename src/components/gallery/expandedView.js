import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Slider from '@material-ui/core/Slider';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import CloseIcon from '@material-ui/icons/CloseOutlined';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import Typography from '@material-ui/core/Typography';
import { resizeEffectHook, useEventListener } from '../../utils/utils';
import FavoriteButton from './favoriteButton';

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

const Thumbnail = ({ image, index, handleClick, active, onLoadedCallback}) => {

    function onClick() {
        handleClick(index);
    }

    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
            <Box style={{
                padding: 3,
                backgroundColor: active === true ? 'black' : null,
                height: 66,
                zIndex: 10
            }}>
                <img
                    alt=""
                    src={image.src}
                    onLoad={onLoadedCallback}
                    onClick={onClick}
                    style={{
                        height: '100%',
                        cursor: 'pointer'
                    }} />
            </Box>
            { active === true && <ArrowDropUpIcon color="primary" fontSize="large" style={{ position: 'relative', top: -10, zIndex: 5 }} />}
        </Box>
    );
}

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
        <IconButton onClick={onClick} >
            <StopIcon fontSize='large'></StopIcon>
            <CircularProgress variant="determinate" value={progress} style={{
                position: "absolute",
                margin: 'auto'
                }}
            />
        </IconButton>
    );
}

const ExpandedView = ({ images, currentId, onClose }) => {

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [currentImage, setCurrentImage] = useState(null);
    const [infoVisible, setInfoVisible] = useState(false);
    const [thumbSliderValue, setThumbSliderValue] = useState(0);
    const [thumbContainerProps, setThumbContainerProps] = useState({
        width: 0,
        scrollLeft: 0,
        maxScrollLeft: 0
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const [thumnailScrollActivated, setThumbnailScrollActivated] = useState(false);
    const thumbContainerRef = useRef(null);
    const headerBarRef = useRef(null);
    const hideHeaderTimeout = useRef(null);

    const [allThumbnailsLoaded, setAllThumbnailsLoaded] = useState(false);
    const numberOfLoadedThumbnails = useRef(0);

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
    }, [])

    const thumbContainerRefCallback = useCallback(element => {
        if (element !== null) {
            thumbContainerRef.current = element;
        }
    }, []);
          
    const onThumbnailLoadedCallback = useCallback(() => {
        numberOfLoadedThumbnails.current++;
        if (numberOfLoadedThumbnails.current === images.length) {
            setAllThumbnailsLoaded(true);
        }
    }, [images]);

    const classes = useStyles();

    resizeEffectHook(thumbContainerRef, handleResize);

    useEventListener('keydown', handleKeyDown);

    useEffect(() => {
        if (allThumbnailsLoaded === false) {
            return;
        }
        handleResize();

    }, [handleResize, allThumbnailsLoaded])

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
    }, [thumbContainerProps, allThumbnailsLoaded]);

    function updateThumbContainerProps(newProps) {
        setThumbContainerProps({
            ...thumbContainerProps, // Initialize with previous props
            ...newProps             // And override with new ones
        })
    }

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
                } else {
                    handleCloseClick();
                }
                break;
            default:
                break;
        }
    }

    function handlePlayClick() {
        hideHeaderBar();
        setInfoVisible(false);
        setIsPlaying(true);
    }

    function handleStopClick() {
        headerBarRef.current.classList.remove('hidden');
        clearTimeout(hideHeaderTimeout.current);
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
        handleThumbnailClick(newIndex);
    }

    function handleNextImage() {
        const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        handleThumbnailClick(newIndex);
    }

    function onImageLoaded(event) {
        event.target.classList.add('loaded');
    }

    function handleThumbnailsScrollLeft() {
        thumbContainerRef.current.scrollBy({
            left: -thumbContainerRef.current.clientWidth,
            behavior: 'smooth'
        });
        updateThumbContainerProps({
            scrollLeft: thumbContainerRef.current.scrollLeft - thumbContainerRef.current.clientWidth
        });
    }

    function handleThumbnailsScrollRight() {
        thumbContainerRef.current.scrollBy({
            left: thumbContainerRef.current.clientWidth,
            behavior: 'smooth'
        });
        updateThumbContainerProps({
            scrollLeft: thumbContainerRef.current.scrollLeft + thumbContainerRef.current.clientWidth
        });
    }

    function scrollThumbnailContainer(targetScroll) {
        thumbContainerRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
        updateThumbContainerProps({
            scrollLeft: targetScroll,
        });
    }

    function getThumbnailRectAt(index) {
        const thumbnail = thumbContainerRef.current.children[index];
        return {
            left: thumbnail.offsetLeft - thumbContainerRef.current.offsetLeft,
            width: thumbnail.clientWidth
        };
    }

    function handleThumbnailScroll(index) {

        const thumbnailRect = getThumbnailRectAt(index);

        if (thumbContainerRef === null || thumbContainerRef.current === null) {
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
    }

    function handleThumbnailClick(index) {
        setCurrentIndex(index);
        handleThumbnailScroll(index);
    }

    function handleThumbSliderChange(event, newSliderValue) {
        setThumbSliderValue(newSliderValue);
        const scrollValue = newSliderValue * thumbContainerProps.maxScrollLeft / 100;
        scrollThumbnailContainer(scrollValue);
    }

    function currentImageHasDetails() {
        if (currentImage === null) {
            return false;
        }
        return currentImage.title.length > 0 || currentImage.description.length > 0
    }

    const thumbnailScollButtonWidth = 50;

    return (
        <Box
            onMouseMove={isPlaying ? handleMouseMove : null}
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
                    width: isPlaying ? "auto" : "100%",
                    position: isPlaying ? "absolute" : "relative",
                    zIndex: isPlaying ? 100 : 1 
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
                            <IconButton onClick={handlePlayClick}><PlayArrowIcon fontSize='large'></PlayArrowIcon></IconButton>
                    }
                    {
                        isPlaying ?
                        null :
                        <React.Fragment>
                            <IconButton onClick={handleInfoClick} disabled={currentImageHasDetails() === false}><InfoIcon fontSize='large'></InfoIcon></IconButton>
                            <FavoriteButton fontSize='large' path={`${currentImage?.path}/${currentImage?.name}`} />
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
                    <IconButton onClick={handleCloseClick}><CloseIcon fontSize='large'></CloseIcon></IconButton>
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

            <Collapse in={!isPlaying}>
                <Paper elevation={4} style={{
                    display: 'flex',
                    flexDirection: 'column'
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
            </Collapse>
        </Box>
    );
};

export default ExpandedView;