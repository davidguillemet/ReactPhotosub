import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import FavoriteIcon from '@material-ui/icons/FavoriteBorderOutlined';
import CloseIcon from '@material-ui/icons/CloseOutlined';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import Typography from '@material-ui/core/Typography';
import { FirebaseApp } from '../firebase';

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
        backgroundColor: 'rgba(255,255,255,0)',
        display: 'flex',
        transition: 'all 500ms',
        '&.active': {
            backgroundColor: 'rgba(255,255,255,0.6)',
            opacity: 1
        }
    }
});

const Thumbnail = ({image, index, handleClick, currentIndex, setActiveThumbnail}) => {

    const [left, setLeft] = useState(0);
    const [width, setWidth] = useState(0);

    function onClick() {
        handleClick(index);
    }
    
    const thumbRef = useCallback(node => {
        if (node !== null) {
            setLeft(node.offsetLeft);
            setWidth(node.clientWidth);
        }
    }, []);

    if (index === currentIndex) {
        setActiveThumbnail(left, width);
    }
    
    return (
        <Box
            key={image.id}
            ref={thumbRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
        }}>
            <Box style={{
                padding: 3,
                backgroundColor: currentIndex === index ? 'black': null,
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
            { currentIndex === index && <ArrowDropUpIcon color="primary" fontSize="large" style={{position: 'relative', top: -10, zIndex: 5}}/>}
        </Box>
    );
}

function useClientRect() {
    const nodeRef = useRef(null);
    const refCallback = useCallback(node => {
      if (node !== null) {
        nodeRef.current = node;
      }
    }, []);
    return [nodeRef, refCallback];
}
  
const ExpandedView = ({ images, currentId, onClose }) => {

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [detailsOverlayRef, setDetailsOverlayRef] = useState(null);
    const [thumbContainerRef, thumbContainerRefCallback] = useClientRect();
    const classes = useStyles();

    useEffect(() => {
        const currentImageIndex = images.findIndex(image => image.id === currentId);
        setCurrentIndex(currentImageIndex);
    }, [currentId, images])

    function handleInfoClick() {
        if (detailsOverlayRef) {
            detailsOverlayRef.classList.toggle('active');
        }
    }

    function handleFavoriteClick() {
        // TODO
    }

    function handleCloseClick() {
        onClose();
    }

    function handlePreviousImage() {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(images.length - 1);
        }
    }

    function handleNextImage() {
        if (currentIndex < images.length - 2) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    }

    function onImageLoaded(event) {
        event.target.classList.add('loaded');
    }

    function handleScrollThumbsLeft() {
        thumbContainerRef.current.scrollBy({
            left: -thumbContainerRef.current.clientWidth,
            behavior: 'smooth'
        });
    }

    function handleScrollThumbsRight() {
        thumbContainerRef.current.scrollBy({
            left: thumbContainerRef.current.clientWidth,
            behavior: 'smooth'
        });
    }

    function scrollThumbnailContainer(targetScroll) {
        thumbContainerRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }

    function setActiveThumbnailPosition(thumbPosition, thumbWidth) {
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

    if (currentId === null || currentIndex < 0) {
        // Empty component if no current image
        return <div></div>;
    }

    const currentImage = images[currentIndex];
    const hasDetails = currentImage.title.length > 0 || currentImage.description.length > 0;

    return (
        <Box style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%',
            padding: 10
        }}>
            <Box style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start'
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
                    <Typography variant="h5" style={{marginRight: 10}}>{`${currentIndex+1} / ${images.length}`}</Typography>
                    <IconButton onClick={handleInfoClick} disabled={hasDetails === false}><InfoIcon fontSize='large'></InfoIcon></IconButton>
                    {
                        FirebaseApp.auth().currentUser ?
                        <IconButton onClick={handleFavoriteClick}><FavoriteIcon fontSize='large'></FavoriteIcon></IconButton> :
                        null
                    }
                </Box>
                <Box style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end'
                    }}
                >
                    <IconButton onClick={handleCloseClick}><CloseIcon fontSize='large'></CloseIcon></IconButton>
                </Box>
            </Box>
            <Box style={{
                    position: 'relative',
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    overflow: 'hidden',
                    padding: 10
                }}
            >
                <img alt="" src={currentImage.src}
                    onLoad={onImageLoaded}
                    className={classes.mainImage}/>
                
                <Box className={classes.detailsOverlay} ref={setDetailsOverlayRef}>
                    <Box style={{
                          margin: 0,
                          position: 'absolute',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '100%',
                          textAlign: 'center'
                    }}>
                        <Typography variant="h3" style={{margin: 10}}>{currentImage.title}</Typography>
                        <Typography variant="h4" style={{marginTop: 30}}>{currentImage.description}</Typography>
                    </Box>
                </Box>

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
            </Box>

            <Box style={{
                backgroundColor: '#eee',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                borderStyle: 'solid',
                borderRadius: 5,
                boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 40%), 0px 3px 4px 0px rgb(0 0 0 / 25%), 0px 1px 8px 0px rgb(0 0 0 / 20%)',
            }}>
                <Box>
                    <IconButton onClick={handleScrollThumbsLeft} >
                        <ArrowBackIosRoundedIcon fontSize='medium'/>
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
                        marginTop: 15
                }}>
                    {
                        images.map((image, index) => <Thumbnail image={image} index={index} handleClick={setCurrentIndex} currentIndex={currentIndex} setActiveThumbnail={setActiveThumbnailPosition} />)
                    }
                </Box>

                <Box>
                    <IconButton onClick={handleScrollThumbsRight} >
                        <ArrowForwardIosRoundedIcon fontSize='medium' />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default ExpandedView;