import { useState, useEffect, useRef } from 'react';
import { gsap } from "gsap";
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import FavoriteButton from '../gallery/favoriteButton';
import { getThumbnailSrc } from '../../utils';
import { useVisible } from '../hooks';
import { styled } from '@mui/material/styles';
import ImageDescription from '../imageDescription';
import {isMobile} from 'react-device-detect';

const Image = styled('img')(({ theme }) => ({ }));

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
                backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }
        }>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: "100%"
            }}>
                <ImageDescription image={image} withNavigation={false}/>
            </Box>
        </Box>
    )
}

const LazyImage = ({
    image,
    index,
    onClick,
    width,
    withOverlay = true,
    renderOverlay = null,
    withFavorite = true,
    disabled = false
}) => {
    const [imageSrc, setImageSrc] = useState(placeHolder);
    const { isVisible, ref: imageRef } = useVisible();
    const loaded = useRef(false);
    const container = useRef();
    const selector = gsap.utils.selector(container);

    useEffect(() => {
        if (isVisible === true) {
            const updatedSrc = getThumbnailSrc(image, width);
            setImageSrc(updatedSrc);
        }
    }, [isVisible, image, width])

    const onLoad = event => {
        if (event.target.src !== placeHolder) {
            // add class loaded and modify ref value to prevent one additional render
            event.target.classList.add('loaded');
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

    const onMouseEnter = () => {
        gsap.to(selector(`#${imageOverlayId}`), { duration: 0.4, opacity: 1 });
        gsap.to(selector(`#${imageId}`), { duration: 2.5, scale: 1.1, ease: "power4.out" });
    };

    const onMouseLeave = () => {
        gsap.to(selector(`#${imageOverlayId}`), { duration: 0.4, opacity: 0 });
        gsap.to(selector(`#${imageId}`), { duration: 2.5, scale: 1, ease: "power4.out"});
    }

    return (
        <Box
            ref={container}
            sx={{
                position: 'relative',
                maxWidth: width,
                width: width,
                height: "100%",
                backgroundColor: theme => theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.13)" : "rgba(0, 0, 0, 0.11)",
                transition: 'top 0.8s, left 0.8s',
                overflow: "hidden",
            }}
            onMouseEnter={(withOverlay || renderOverlay) && isMobile === false? onMouseEnter : null}
            onMouseLeave={(withOverlay || renderOverlay) && isMobile === false ? onMouseLeave : null}
        >
            <Image
                id={imageId}
                sx={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    opacity: loaded.current ? (disabled ? 0.7 : 1) : 0,
                    transition: 'opacity 1.5s',
                    '&.loaded': {
                        opacity: 1
                    }
                }}
                ref={imageRef}
                src={imageSrc}
                alt={image.description || image.title}
                onLoad={onLoad}
                onError={onError}
            />

            {
                renderOverlay && renderOverlay(image)
            }

            {
                withOverlay && renderOverlay === null && <Overlay image={image} id={imageOverlayId} />
            }

            {
                disabled === false && onClick &&
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
                    size={isMobile ? 'small' : 'large'}
                    color={'white'}
                    style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0
                    }}
                />
            }
        </Box>
    );
}

export default LazyImage;