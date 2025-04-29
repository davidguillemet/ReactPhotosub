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
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import AppsIcon from '@mui/icons-material/Apps';
import { useEventListener, getThumbnailSrc, useTranslation, useLanguage, parseImageDescription } from '../../utils';
import FavoriteButton from './favoriteButton';
import ImageSlider from '../imageSlider';
import ImageInfo from './imageInfo';
import { useResizeObserver } from 'components/hooks';
import { useScrollBlock, openFullscreen, closeFullscreen } from '../../utils';

import TooltipIconButton from 'components/tooltipIconButton';
import { HorizontalSpacing } from 'template/spacing';

import {isMobile} from 'react-device-detect';

import { gsap } from "gsap";
import { useGSAP } from '@gsap/react';

import useEmblaCarousel from 'embla-carousel-react';

import './css/imageLoading.css';

const NavigationButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
}));

const StyleImage = styled('img')(({ theme }) => ({ }));
const StyleDiv = styled('div')(({ theme }) => ({ }));

function StopButtonWithCircularProgress({ onClick, onCompletedRef, duration, size, height}) {

    const t = useTranslation("components.gallery");
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
            tooltip={t("btn:stopSlideshow")}
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
                color="secondary"
            />
        </TooltipIconButton>
    );
}

const PLACEHOLDER_SRC = `data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D`;

const getSlideSrc = (image, visible, availableWidth, availableHeight) => {
    if (!visible) {
        return PLACEHOLDER_SRC;
    }
    if (availableWidth === 0 || availableHeight === null) {
        return null;
    }
    return getThumbnailSrc(image, availableWidth, availableHeight);
}

const imageLoadingAnimationDuration = '500ms';

const SlideRenderer = ({image, visible, containerWidth, containerHeight}) => {

    const slideSrc = useMemo(() => getSlideSrc(image, visible, containerWidth, containerHeight), [image, visible, containerWidth, containerHeight]);

    function onImageLoaded(event) {
        if (slideSrc !== PLACEHOLDER_SRC) {
            event.target.parentElement.classList.add('loadedSlide');
        }
    }

    return (
        <StyleDiv
            className="embla__slide"
            sx={{
                flex: "0 0 100%",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}
        >
            <StyleImage
                alt=""
                onLoad={onImageLoaded}
                src={slideSrc}
                className='slideImage'
                sx={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    opacity: 0,
                    transition: `opacity ${imageLoadingAnimationDuration}`,
                    objectFit: 'contain' // Prevent portrait image being enlarged on chrome windows (at least)
                }}
            />
            <CircularProgress
                className={'slideLoader'}
                sx={{
                    position: 'absolute',
                    opacity: 1,
                    transition: `opacity ${imageLoadingAnimationDuration}`,
                }}
            />
        </StyleDiv>
    );
}

const EmblaCarousel = React.forwardRef(({
    images,
    initialIndex,
    onChangeIndex,
    containerWidth,
    containerHeight}, inRef) => {

    const initialIndexRef = useRef(initialIndex);
    const [visibleSlides, setVisibleSlides] = useState(new Set());


    const [emblaRef, emblaApi] = useEmblaCarousel({
        startIndex: initialIndexRef.current,
        loop: false
    });

    const emblaRefCallback  = useCallback((localRef) => {
        if (localRef) {
            emblaRef(localRef);
        }
        inRef.current = emblaApi;
    }, [inRef, emblaRef, emblaApi]);

    const updateVisibleSlides = useCallback((emblaApi) => {
        setVisibleSlides((prevSlidesInView) => {
            if (prevSlidesInView.size === emblaApi.slideNodes().length) {
                emblaApi.off('slidesInView', updateVisibleSlides);
            }
            const newSlidesInView = new Set(prevSlidesInView);
            emblaApi.slidesInView().forEach(index => newSlidesInView.add(index));
            return newSlidesInView;
        });
    }, []);

    const onSelectedSlideChanged = useCallback(() => {
        const selectedSlide = emblaApi.selectedScrollSnap();
        if (onChangeIndex) {
            onChangeIndex(selectedSlide);
        }
    }, [emblaApi, onChangeIndex]);

    useEffect(() => {
        if (!emblaApi) return;
        updateVisibleSlides(emblaApi);
        emblaApi.on('slidesInView', updateVisibleSlides)
        emblaApi.on('reInit', updateVisibleSlides)
        emblaApi.on('select', onSelectedSlideChanged);
    }, [emblaApi, updateVisibleSlides, onSelectedSlideChanged]);

    return (
        <StyleDiv className="embla" sx={{ width: "100%", height: "100%"}} ref={emblaRefCallback}>
            <StyleDiv className="embla__container" sx={{ display: 'flex', height: '100%' }}>
                {
                    images && images.map((image, index) => {
                        return (
                            <SlideRenderer
                                key={image.id}
                                image={image}
                                containerWidth={containerWidth}
                                containerHeight={containerHeight}
                                visible={visibleSlides.has(index)}
                            />
                        );
                    })
                }
            </StyleDiv>
        </StyleDiv>
    );
});

const ExpandedView = React.forwardRef(({
    images,
    count,
    index,
    onChangeIndex = null,
    onClose,
    displayDestination = true ,
    hasNext = false,
    onNextPage = null}, ref) => {

    const t = useTranslation("components.gallery");
    const { language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(index);
    const [infoVisible, setInfoVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const headerBarRef = useRef(null);
    const hideHeaderTimeout = useRef(null);
    const handleNextImageRef = useRef(null);

    const waitingForNextPage = useRef(false);

    let sliderApiRef = useRef(null);

    const slideContainerResizeObserver = useResizeObserver();
    const [blockScroll, allowScroll] = useScrollBlock();

    useEventListener('keydown', handleKeyDown);

    const currentImage = useMemo(() => images[currentIndex], [images, currentIndex]);
    const currentImageDesc = useMemo(() => parseImageDescription(currentImage)[language], [currentImage, language]);

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

    useEffect(() => {
        if (sliderApiRef.current) {
            const currentSliderIndex = sliderApiRef.current.selectedScrollSnap();
            // No animation if scroll more than 1 slide
            const jump = Math.abs(currentIndex - currentSliderIndex) > 1;
            sliderApiRef.current.scrollTo(currentIndex, jump);
        }
    }, [currentIndex]);

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

    const animationEase = "power1.inOut";
    const animationDuration = 0.4;
    const collapseTimelineRef = React.useRef(null);
    const sliderContainerRef = React.useRef(null);

    useGSAP(() => {
        if (!showThumbnails) {
            if (collapseTimelineRef.current === null) {
                const collapseTween = gsap.to(sliderContainerRef.current, {
                    duration: animationDuration,
                    ease: animationEase,
                    height: 0,
                    paddingTop: 0,
                    paddingBottom: 0
                });
                collapseTimelineRef.current = gsap.timeline();
                collapseTimelineRef.current.add(collapseTween);
            }
            collapseTimelineRef.current.play();
        } else if (collapseTimelineRef.current !== null) {
            collapseTimelineRef.current.reverse();
        }
    }, {
        dependencies: [showThumbnails],
    });

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
        if (isPlaying && currentIndex >= count - 1) {
            handleStopClick();
        } else if (currentIndex < images.length - 1) {
            handleThumbnailClick(currentIndex + 1);
        } else if (currentIndex < count - 1 && hasNext && onNextPage) {
            waitingForNextPage.current = true;
            onNextPage();
        }
    }

    // To avoid useless StopButtonWithCircularProgress rerendering
    handleNextImageRef.current = handleNextImage;

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
                padding: 0
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
                                tooltip={t("btn:startSlideshow")}
                                onClick={handlePlayClick}
                                disabled={playable === false}
                                size={toolbarIconSize}
                            >
                                <PlayCircleOutlineIcon fontSize="inherit" />
                            </TooltipIconButton>
                    }

                    <React.Fragment>
                        <TooltipIconButton
                            tooltip={infoVisible ? t("btn:hideDetails") : t("btn:showDetails")}
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
                            tooltip={fullScreen ? t("btn:exitFullScreen") : t("btn:enterFullScreen")}
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
                            tooltip={showThumbnails ? t("btn:hideThumbnails") : t("btn:showThumbnails")}
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
                            tooltip={t("btn:closeViewer")}
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
                id="imagecontainer"
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

                <EmblaCarousel
                    ref={sliderApiRef}
                    images={images}
                    containerWidth={slideContainerResizeObserver.width}
                    containerHeight={slideContainerResizeObserver.height}
                    initialIndex={index}
                    onChangeIndex={handleThumbnailClick}
                />

                {
                    currentImageDesc &&
                    <ImageInfo
                        container={slideContainerResizeObserver.element}
                        style={{
                            mb: fullScreen ? 1 : 0
                        }}
                        image={currentImage}
                        displayDestination={displayDestination}
                        visible={infoVisible}
                        displayTags={false}
                        onClose={handleInfoClick}
                    />
                }

                {
                    !isMobile && 
                    <Collapse in={!isPlaying}>
                        <NavigationButton
                            disabled={currentIndex === 0}
                            onClick={handlePreviousImage}
                            style={{
                                left: 10
                            }}
                            size="large"
                        >
                            <ArrowBackIosRoundedIcon fontSize='large' />
                        </NavigationButton>
                    </Collapse>
                }

                { /* if mobile, show the button if it's the last of the current page */
                    (!isMobile || (currentIndex === images.length - 1 && images.length < count)) &&
                    <Collapse in={!isPlaying}>
                        <NavigationButton
                            disabled={currentIndex === count - 1}
                            onClick={handleNextImage}
                            style={{
                                right: 10
                            }}
                            size="large"
                        >
                            <ArrowForwardIosRoundedIcon fontSize='large' />
                        </NavigationButton>
                    </Collapse>
                }

                { /* Overlay when waiting for the next page */ }
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

            <Paper
                ref={sliderContainerRef}
                sx={{
                    borderTopWidth: '1px',
                    borderTopStyle: 'solid',
                    borderTopColor: 'divider',
                    overflow: 'hidden',
                    py: 0,
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

        </Box>
    );
});

export default ExpandedView;