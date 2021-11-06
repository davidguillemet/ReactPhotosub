import { useState, useEffect, useRef } from 'react';
import { gsap } from "gsap";
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import FavoriteButton from '../gallery/favoriteButton';
import { getThumbnailSrc } from '../../utils';
import { useVisible } from '../hooks';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import ImageDescription from '../imageDescription';

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
            <ImageDescription image={image} />
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
            // add class loaded and modify ref valeu to prevent one additional render
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
            key={image.id}
            sx={{
                position: 'relative',
                maxWidth: width,
                width: width,
                height: "100%",
                bgcolor: grey[100],
                transition: 'top 0.8s, left 0.8s',
                overflow: "hidden",
            }}
            onMouseEnter={(withOverlay || renderOverlay) ? onMouseEnter : null}
            onMouseLeave={(withOverlay || renderOverlay) ? onMouseLeave : null}
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
                alt=""
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