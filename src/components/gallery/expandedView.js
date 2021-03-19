import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import FavoriteIcon from '@material-ui/icons/FavoriteOutlined';
import CloseIcon from '@material-ui/icons/CloseOutlined';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

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
    }
});

const ExpandedView = ({ images, currentId, onClose }) => {

    const [currentIndex, setCurrentIndex] = useState(-1);
    const classes = useStyles();

    useEffect(() => {
        const currentImageIndex = images.findIndex(image => image.id === currentId);
        setCurrentIndex(currentImageIndex);
    }, [currentId, images])

    function handleInfoClick() {
        // TODO
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
                    <IconButton onClick={handleInfoClick}><InfoIcon fontSize='large'></InfoIcon></IconButton>
                    <IconButton onClick={handleFavoriteClick}><FavoriteIcon fontSize='large'></FavoriteIcon></IconButton>
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