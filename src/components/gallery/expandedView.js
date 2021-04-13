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
import FavoriteIcon from '@material-ui/icons/FavoriteBorderOutlined';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import CloseIcon from '@material-ui/icons/CloseOutlined';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import Typography from '@material-ui/core/Typography';
import { FirebaseApp } from '../firebase';
import { resizeEffectHook, useEventListener } from '../../utils/utils';

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

const Thumbnail = ({ image, index, handleClick, active, rectCallback }) => {

    function onClick() {
        handleClick(index);
    }

    const thumbRef = useCallback(node => {
        if (node !== null) {
            rectCallback(index, {
                left: node.offsetLeft,
                width: node.clientWidth
            });
        }
    }, [index, rectCallback]);

    return (
        <Box
            ref={thumbRef}
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
            <CircularProgress variant="determinate" disableShrink={true} value={progress} style={{
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
    const [thumbScrollLeft, setThumbScrollLeft] = useState(0);
    const [thumbContainerWidth, setThumbContainerWidth] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const thumbnailsRect = useRef({});
    const thumbContainerRef = useRef(null);
    const headerBarRef = useRef(null);
    const hideHeaderTimeout = useRef(null);

    const thumbContainerRefCallback = useCallback(element => {
        if (element !== null) {
            thumbContainerRef.current = element;
            setThumbContainerWidth(thumbContainerRef.current.clientWidth);
        }
    }, []);

    const classes = useStyles();

    resizeEffectHook(thumbContainerRef, handleResize);

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

    useEffect(() => {
        let fixedScrollValue = thumbScrollLeft;
        if (fixedScrollValue < 0) {
            fixedScrollValue = 0;
        }
        const maxScrollLeft = getMaxScrollLeft();
        if (fixedScrollValue > maxScrollLeft) {
            fixedScrollValue = maxScrollLeft;
        }
        setThumbSliderValue(thumbScrollLeft * 100 / maxScrollLeft);
    }, [thumbScrollLeft, thumbContainerWidth]);

    function handleMouseMove() {
        headerBarRef.current.classList.remove('hidden');
        clearTimeout(hideHeaderTimeout.current);
        hideHeaderTimeout.current = setTimeout(hideHeaderBar, 3000);
    }

    function hideHeaderBar() {
        headerBarRef.current.classList.add('hidden');
    }

    function handleResize() {
        // Mahe sure to synchronize the slider with the effective thumbnail scroll position that can
        // change when resizing the window
        setThumbContainerWidth(thumbContainerRef.current.clientWidth);
        setThumbScrollLeft(thumbContainerRef.current.scrollLeft);
    }

    function handleKeyDown(event) {
        console.log(event);
        switch (event.code) { // or event.key or event.keyCode as integer
            case "ArrowLeft":
                handlePreviousImage();
                break;
            case "ArrowRight":
                handleNextImage();
                break;
            case "Escape":
                if (isPlaying) {
                    headerBarRef.current.classList.remove('hidden');
                    clearTimeout(hideHeaderTimeout.current);
                    handleStopClick();
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
        setIsPlaying(false);
    }

    function handleInfoClick() {
        setInfoVisible(!infoVisible);
    }

    function handleFavoriteClick() {
        // TODO
    }

    function handleCloseClick() {
        onClose();
    }

    function handlePreviousImage() {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        handleThumbnailClick(newIndex);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    function handleNextImage() {
        const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        handleThumbnailClick(newIndex);
    }

    function onImageLoaded(event) {
        event.target.classList.add('loaded');
    }

    function handleScrollThumbsLeft() {
        thumbContainerRef.current.scrollBy({
            left: -thumbContainerRef.current.clientWidth,
            behavior: 'smooth'
        });
        setThumbScrollLeft(thumbContainerRef.current.scrollLeft - thumbContainerRef.current.clientWidth);
    }

    function handleScrollThumbsRight() {
        thumbContainerRef.current.scrollBy({
            left: thumbContainerRef.current.clientWidth,
            behavior: 'smooth'
        });
        setThumbScrollLeft(thumbContainerRef.current.scrollLeft + thumbContainerRef.current.clientWidth);
    }

    function scrollThumbnailContainer(targetScroll) {
        thumbContainerRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
        setThumbScrollLeft(targetScroll);
    }

    // TODO : move into hook and use onResize to compute?
    function getMaxScrollLeft() {
        const lastThumb = thumbContainerRef.current.children[thumbContainerRef.current.children.length - 1];
        const thumbContainerContentWidth = lastThumb.offsetLeft - thumbContainerRef.current.offsetLeft + lastThumb.clientWidth;
        return thumbContainerContentWidth - thumbContainerRef.current.clientWidth;
    }

    function handleThumbnailScroll(index) {

        const thumbnailRect = thumbnailsRect.current[index];
        const thumbPosition = thumbnailRect.left;
        const thumbWidth = thumbnailRect.width;

        if (thumbContainerRef === null || thumbContainerRef.current === null) {
            return;
        }

        const thumbnailLeftVisualPosition = thumbPosition - thumbContainerRef.current.offsetLeft - thumbContainerRef.current.scrollLeft;
        if (thumbnailLeftVisualPosition < 0) {
            scrollThumbnailContainer(thumbPosition - thumbContainerRef.current.offsetLeft);
            return;
        }

        const thumbnailRightVisualPosition = thumbnailLeftVisualPosition + thumbWidth;
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
        // Update scroll
        const maxScrollLeft = getMaxScrollLeft();
        const scrollValue = newSliderValue * maxScrollLeft / 100;
        scrollThumbnailContainer(scrollValue);
    }

    function thumbnailRectCallback(index, rect) {
        thumbnailsRect.current[index] = rect;
    }

    function currentImageHasDetails() {
        if (currentImage === null) {
            return false;
        }
        return currentImage.title.length > 0 || currentImage.description.length > 0
    }

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
                            <StopButtonWithCircularProgress onClick={handleStopClick} onCompleted={handleNextImage} duration={3000} key={currentImage?.id}/> :
                            <IconButton onClick={handlePlayClick}><PlayArrowIcon fontSize='large'></PlayArrowIcon></IconButton>
                    }
                    {
                        isPlaying ?
                        null :
                        <React.Fragment>
                            <IconButton onClick={handleInfoClick} disabled={currentImageHasDetails() === false}><InfoIcon fontSize='large'></InfoIcon></IconButton>
                            {
                                FirebaseApp.auth().currentUser ?
                                <IconButton onClick={handleFavoriteClick}><FavoriteIcon fontSize='large'></FavoriteIcon></IconButton> :
                                null
                            }
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
                            }}>
                            <img alt="" src={currentImage?.src}
                                onLoad={onImageLoaded}
                                className={classes.mainImage
                                } />
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
                    <Box style={{
                        paddingRight: 50,
                        paddingLeft: 50
                    }}>
                        <Slider value={thumbSliderValue} onChange={handleThumbSliderChange} />
                    </Box>
                    <Box style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Box>
                            <IconButton onClick={handleScrollThumbsLeft} >
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
                            }}>
                            {
                                images.map((image, index) => <Thumbnail key={image.id} image={image} index={index} handleClick={handleThumbnailClick} active={currentIndex === index} rectCallback={thumbnailRectCallback} />)
                            }
                        </Box>

                        <Box>
                            <IconButton onClick={handleScrollThumbsRight} >
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