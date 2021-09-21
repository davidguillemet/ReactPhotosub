import { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import FavoriteButton from './favoriteButton';
import { getThumbnailSrc } from '../../utils';
import { useIntersectionObserver } from '../hooks';

const placeHolder = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=`;

const useStyles = makeStyles(() => ({
    imageContainer: {
        display: "block",
        position: 'absolute',
        opacity: 0,
        transition: 'top 0.8s, left 0.8s, opacity 1.5s',
        overflow: "hidden",
        '&:hover div[class*="imageOverlay"]': {
            opacity: 1,
            transition: 'opacity 800ms'
        },
        '&:hover img[class*="lazyImage"]': {
            opacity: 0.5,
            transform: 'scale(1.1)',
            transition: 'opacity 1s, transform 4s cubic-bezier(.17,.53,.29,1.01)'
        },
        '&.loaded': {
            opacity: 1
        }
    },
    lazyImage: {
        display: 'block',
        width: '100%',
    },
    imageOverlay: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0,
        color: "#fff",
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        transition: 'opacity 800ms'
    },
    icon: {
        color: 'white',
    }
}));

const LazyImage = ({ image, index, onClick, top, left, width }) => {
    const [imageSrc, setImageSrc] = useState(placeHolder);
    const onVisible = useCallback(() => {
        const updatedSrc = getThumbnailSrc(image, width);
        setImageSrc(updatedSrc);
    }, [image, width]);
    const imageRef = useIntersectionObserver(onVisible);
    const classes = useStyles();
    
    const onLoad = event => {
        if (event.target.src !== placeHolder) {
            event.target.parentNode.classList.add('loaded');
        }
    }
    
    const onError = event => {
        event.target.classList.add('has-error');
    }

    function handleImageClick() {
        if (onClick) {
            onClick(index);
        }
    }

    // Build a CSS calculation for the image height
    // This allow a correct layout when we resize the window while we are at not at the top of the page.
    // If we don't use this calculation, the images at the top won't be loaded yet and the img height won't be known by the browser,
    // that won't be able to layout correctly the top of the columns...
    const imageHeight = width / image.sizeRatio;

    return (
        <div
            className={classes.imageContainer}
            style={{
                top: top,
                left: left,
                maxWidth: width,
                width: width,
                height: imageHeight
            }}
        >
            <img
                className={classes.lazyImage}
                ref={imageRef}
                src={imageSrc}
                alt="alt"
                onLoad={onLoad}
                onError={onError}
            />

            <div className={classes.imageOverlay}>
                <Typography variant="h6" align="center">{image.title}</Typography>
            </div>

            <ButtonBase
                onClick={handleImageClick}
                style={{
                    display: "block",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%"
                }}
            />

            <FavoriteButton
                image={image}
                color={'white'}
                style={{
                    display: "block",
                    position: "absolute",
                    bottom: 10,
                    right: 10
                }}
            />
        </div>
    );
}

export default LazyImage;