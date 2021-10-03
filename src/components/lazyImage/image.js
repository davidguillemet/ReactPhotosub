import { useState, useEffect, useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ButtonBase from '@material-ui/core/ButtonBase';
import FavoriteButton from '../gallery/favoriteButton';
import { getThumbnailSrc } from '../../utils';
import { useVisible } from '../hooks';

const placeHolder = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=`;
const imageOverlayId = "imageOverlay";
const imageId = "lazyImage";

const Overlay = ({image, id}) => {
    return (
        <Box
            id={id}
            sx={{
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
        }>
            <Typography variant="h6" align="center">{image.title}</Typography>
        </Box>
    )
}

const LazyImage = ({
    image,
    index,
    onClick,
    width,
    withOverlay = true,
    withFavorite = true,
    hoverEffect = true,
    disabled = false
}) => {
    const [imageSrc, setImageSrc] = useState(placeHolder);
    const { isVisible, ref: imageRef } = useVisible();
    const loaded = useRef(false);

    useEffect(() => {
        if (isVisible === true) {
            const updatedSrc = getThumbnailSrc(image, width);
            setImageSrc(updatedSrc);
        }
    }, [isVisible, image, width])

    const onLoad = event => {
        if (event.target.src !== placeHolder) {
            // add class loaded and modify ref valeu to prevent one additional render
            event.target.parentNode.classList.add('loaded');
            loaded.current = true;
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
        <Box
            key={image.id}
            sx={{
                position: 'relative',
                maxWidth: width,
                width: width,
                opacity: loaded.current ? 1 : 0,
                transition: 'top 0.8s, left 0.8s, opacity 1.5s',
                overflow: "hidden",
                '&.loaded': {
                    opacity: 1
                },
                ...(
                    hoverEffect && {
                        [`&:hover div#${imageOverlayId}`]: {
                            opacity: 1,
                            transition: 'opacity 800ms'
                        },
                        [`&:hover img#${imageId}`]: {
                            opacity: 0.5,
                            transform: 'scale(1.1)',
                            transition: 'opacity 1s, transform 2s cubic-bezier(.17,.53,.29,1.01)'
                        }
                    }
                )
            }}
        >
            <img
                id={imageId}
                style={{
                    display: 'block',
                    width: '100%',
                    opacity: disabled ? 0.7 : 1
                }}
                ref={imageRef}
                src={imageSrc}
                alt="alt"
                onLoad={onLoad}
                onError={onError}
            />

            {
                withOverlay && <Overlay image={image} id={imageOverlayId} />
            }

            {
                disabled === false &&
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
            }

            {
                withFavorite && 
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
            }
        </Box>
    );
}

export default LazyImage;