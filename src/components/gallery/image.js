import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import FavoriteButton from './favoriteButton';
import { getThumbnailSrc } from '../../utils';
import { useVisible } from '../hooks';

const placeHolder = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=`;

const useStyles = makeStyles(() => ({
    imageContainer: {
        position: 'relative',
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

const LazyImage = ({ image, index, onClick, width }) => {
    const classes = useStyles();
    const [imageSrc, setImageSrc] = useState(placeHolder);
    const { isVisible, ref: imageRef } = useVisible();

    useEffect(() => {
        if (isVisible === true) {
            const updatedSrc = getThumbnailSrc(image, width);
            setImageSrc(updatedSrc);
        }
    }, [isVisible, image, width])

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

    return (
        <div
            className={classes.imageContainer}
            style={{
                maxWidth: width,
                width: width
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