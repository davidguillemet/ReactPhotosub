import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';

const placeHolder = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=`;

const useStyles = makeStyles(theme => ({
    imageContainer: {
        display: "block",
        width: "100%",
        position: "relative",
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
    }
}));

const LazyImage = ({ image, margin, onClick }) => {
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

    return (
        <div
            className={classes.imageContainer}
            style={{
                marginTop: margin
            }}>
                <img
                    className={classes.lazyImage}
                    ref={setImageRef}
                    src={imageSrc}
                    alt="alt"
                    onLoad={onLoad}
                    onError={onError}
                    style={{
                        height: Math.round(image.displayHeight)
                    }}
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
        </div>
    );
}

export default LazyImage;