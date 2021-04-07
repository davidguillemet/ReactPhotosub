import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/FavoriteBorderOutlined';
import Tooltip from '@material-ui/core/Tooltip';

const placeHolder = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=`;

const useStyles = makeStyles(theme => ({
    imageContainer: {
        display: "block",
        position: 'absolute',
        transition: 'top 0.8s, left 0.8s, width 0.8s, height 0.8s',
        overflow: "hidden",
        '&:hover div[class*="imageOverlay"]': {
            opacity: 1,
            transition: 'opacity 800ms'
        },
        '&:hover img[class*="lazyImage"]': {
            opacity: 0.5,
            transform: 'scale(1.1)',
            transition: 'opacity 1s, transform 4s cubic-bezier(.17,.53,.29,1.01)'
        }
    },
    lazyImage: {
        display: 'block',
        width: '100%',
        opacity: 1,
        transition: 'opacity 1s, transform 1.3s',
        '&.loaded:not(.has-error)': {
            animation: `$imageLoaded 2000ms ${theme.transitions.easing.easeInOut}`
        },
        '&.has-error': {
            content: `url(${placeHolder})`
        }
    },
    '@keyframes imageLoaded': {
        "0%": {
            opacity: 0
        },
        "100%": {
            opacity: 1
        }
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

const LazyImage = ({ image, onClick, top, left, width }) => {
    const [imageSrc, setImageSrc] = useState(placeHolder);
    const [imageRef, setImageRef] = useState(null);

    const classes = useStyles();
    
    const onLoad = event => {
        if (event.target.src !== placeHolder) {
            event.target.classList.add('loaded');
        }
    }
    
    const onError = event => {
        event.target.classList.add('has-error');
    }

    useEffect(() => {
        let observer
        let didCancel = false

        if (imageRef && imageSrc === placeHolder) {
            if (IntersectionObserver) {
                observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            // when image is visible in the viewport + rootMargin
                            if (!didCancel &&
                                (entry.intersectionRatio > 0 || entry.isIntersecting)) {
                                    console.log("Load image " + image.src);
                                setImageSrc(image.src)
                            }
                        })
                    }
                )
                observer.observe(imageRef)
            } else {
                // Old browsers fallback
                setImageSrc(image.src)
            }
        }

        return () => {
            didCancel = true
            // on component unmount, we remove the listner
            if (observer && observer.unobserve) {
                observer.unobserve(imageRef)
            }
        }
    }, [imageRef, imageSrc, image]);

    function handleImageClick() {
        if (onClick) {
            onClick(image.id);
        }
    }

    // Build a CSS calculation for the image height
    // This allow a correct layout when we resize the window while we are at not at the top of the page.
    // If we don't use this calculation, the images at the top won't be loaded yet and the img height won't be known by the browser,
    // that won't be able to layout correctly the top of the columns...
    const heightFormula = `calc(var(--width)/${image.sizeRatio})`;

    return (
        <div
            className={classes.imageContainer}
            style={{
                top: top,
                left: left,
                "--width": width,
                maxWidth: 'var(--width)',
                width: 'var(--width)',
                height: heightFormula
    }}>
                <img
                    className={classes.lazyImage}
                    ref={setImageRef}
                    src={imageSrc}
                    alt="alt"
                    onLoad={onLoad}
                    onError={onError}
                />
                <div className={classes.imageOverlay}>
                    <Typography variant="h6" align="center">{image.title}</Typography>
                </div>
            <ButtonBase onClick={handleImageClick} style={{
                display: "block",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"
            }}/>
            <Tooltip title="Ajouter aux favoris">
            <IconButton className={classes.icon} style={{
                display: "block",
                position: "absolute",
                bottom: 10,
                right: 10,
            }}>
                <FavoriteIcon fontSize='large' />
            </IconButton>
            </Tooltip>
        </div>
    );
}

export default LazyImage;