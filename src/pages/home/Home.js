import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { styled } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles.css';

import {unstable_batchedUpdates} from 'react-dom';

import { uniqueID, shuffleArray, getBlurrySrc, isBlurrySrc } from '../../utils';
import { GlobalContext } from '../../components/globalContext';
import { useScrollBlock } from '../../utils';

const _diaporamaInterval = 10000;
const _cacheKey = "homeImages";

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
    if (images !== null) {
        const currentImage = images[currentImageIndex];
        currentImageSrc = currentImage.isLoaded ? currentImage.src : currentImage.blurrySrc
    }

    return (
        <MainImageStyled 
            alt=""
            onLoad={handleImageLoaded}
            src={currentImageSrc}
        />
    )
};

const Home = () => {

    const context = useContext(GlobalContext);
    const [images, setImages] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(-1);
    const [blockScroll, allowScroll] = useScrollBlock();

    const diaporamaTimeoutRef = useRef(null);

    useEffect(() => {
        const processHomeImages = (images) => {
            unstable_batchedUpdates(() => {
                setImages(shuffleArray(images).map(image => {
                    return {
                        ...image,
                        blurrySrc: getBlurrySrc(image.src),
                        id: uniqueID()
                    }
                }));
                setCurrentImageIndex(0);
            })
        };
        const cachedData = sessionStorage.getItem(_cacheKey);
        let done = false;
        if (cachedData) {
            try
            {
                processHomeImages(JSON.parse(cachedData));
                done = true;
            }
            catch (e)
            {
                done = false;
            }
        }

        if (done === false) {
            context.dataProvider.getImageDefaultSelection().then((images) => {
                sessionStorage.setItem(_cacheKey, JSON.stringify(images));
                processHomeImages(images)
            });
        }

        //blockScroll();

        return () => {
            //allowScroll();
            clearTimeout(diaporamaTimeoutRef.current);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context.dataProvider]);

    const handleNextImage = useCallback(() => {
        setCurrentImageIndex(prevIndex => {
            if (prevIndex >= images.length - 1) {
                return 0;
            }
            return prevIndex + 1;
        });
    }, [images]);

    const handleImageLoaded = (event) => {
        event.target.classList.add('loaded');
        if (isBlurrySrc(event.target.src)) {
            // We just loaded the blurry version, now load the normal version
            event.target.src = images[currentImageIndex].src
        } else if (images !== null) {
            images[currentImageIndex].isLoaded = true;
            diaporamaTimeoutRef.current = setTimeout(handleNextImage, _diaporamaInterval);
        }
    };

    return (
        <React.Fragment>
            <TransitionGroup component={null}>
                <CSSTransition
                    key={currentImageIndex}
                    timeout={2000}
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
};

export default Home;