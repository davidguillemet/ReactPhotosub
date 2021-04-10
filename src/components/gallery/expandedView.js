import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import FavoriteIcon from '@material-ui/icons/FavoriteBorderOutlined';
import CloseIcon from '@material-ui/icons/CloseOutlined';
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

const ExpandedView = ({ images, currentId, onClose }) => {

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [detailsOverlayRef, setDetailsOverlayRef] = useState(null);
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
                        justifyContent: 'flex-start'
                    }}
                >
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
                    overflow: 'hidden'
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
        </Box>
    );
};

export default ExpandedView;