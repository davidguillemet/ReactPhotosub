import React, { useEffect, useState, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles.css';

import { uniqueID, shuffleArray } from '../../utils';
import { useGlobalContext } from '../../components/globalContext';
import { useScrollBlock } from '../../utils';
import { buildLoadingState, withLoading } from '../../components/loading';

const _diaporamaInterval = 5000;
const _transitionDuration = 2000;

const MainImageStyled = styled('img')({
    display: 'block',
    minHeight: '100%',
    minWidth : '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'cover' // prevent image from shrinking when window width is too small
});

const MainImage = ({images, currentImageIndex, handleImageLoaded}) => {

    let currentImageSrc = "/home_initial.jpg";

    if (images !== null && currentImageIndex >= 0) {
        const currentImage = images[currentImageIndex % images.length];
        currentImageSrc = currentImage.src;
    }

    return (
        <MainImageStyled 
            alt=""
            onLoad={handleImageLoaded}
            src={currentImageSrc}
        />
    )
};

const Home = withLoading(({images, currentIndex}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
    const [blockScroll, allowScroll] = useScrollBlock();
    const diaporamaTimeoutRef = useRef(null);

    useEffect(() => {
        blockScroll();
        return () => {
            allowScroll();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(diaporamaTimeoutRef.current);
        }
    }, []);

    const handleNextImage = useCallback(() => {
        if (images === null) {
            return;
        }
        setCurrentImageIndex(prevIndex => prevIndex + 1);
    }, [images]);

    const nextImage = useCallback(() => {
        diaporamaTimeoutRef.current = setTimeout(handleNextImage, _diaporamaInterval);
    }, [handleNextImage]);

    const handleImageLoaded = useCallback((event) => {
        event.target.classList.add('loaded');
        nextImage();
    }, [nextImage]);

    useEffect(() => {
        const visibilityListener = () => {
            switch(document.visibilityState) {
                case "hidden":
                    // Stop diaporama
                    if (typeof diaporamaTimeoutRef.current === 'number') {
                        clearTimeout(diaporamaTimeoutRef.current);
                    }
                    break;
                case "visible":
                    // Start Diaporama again
                    nextImage();
                    break;
                default:
            }
        }
        document.addEventListener("visibilitychange", visibilityListener);
    }, [nextImage]);

    return (
        <React.Fragment>
            <TransitionGroup component={null}>
                <CSSTransition
                    key={currentImageIndex}
                    timeout={_transitionDuration}
                    classNames="slide"
                >
                    <Box
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            padding: 0,
                            overflow: 'hidden'
                        }}
                    >
                        <MainImage
                            images={images}
                            currentImageIndex={currentImageIndex}
                            handleImageLoaded={handleImageLoaded}
                        />
                    </Box>
                </CSSTransition>
            </TransitionGroup>
        </React.Fragment>
    )
}, [buildLoadingState("images", null)]);

const HomeController = () => {
    const context = useGlobalContext();
    const [images, setImages] = useState(null);
    const { data } = context.useFetchHomeSlideshow();
    useEffect(() => {
        if (data === undefined) {
            return;
        }
        setImages(shuffleArray(data).map(image => {
            return {
                ...image,
                id: uniqueID()
            }
        }));
    }, [data]);

    return (
        <Home images={images} currentIndex={-1} />
    )
}

export default HomeController;