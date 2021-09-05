import React, { useState, useRef, useCallback, useContext } from 'react';
import { styled } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { withLoading, buildLoadingState } from '../../components/loading';
import './styles.css';

import {unstable_batchedUpdates} from 'react-dom';

import { uniqueID, shuffleArray, getBlurrySrc, isBlurrySrc } from '../../utils';
import { GlobalContext } from '../../components/globalContext';
import { useCancellable } from '../../dataProvider';

const _diaporamaInterval = 10000;

const MainImageStyled = styled('img')({
    display: 'block',
    minHeight: '100%',
    minWidth : '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'cover' // prevent image from shrinking when window width is too small
});

const MainImage = withLoading(({images, currentImageIndex, handleImageLoaded}) => {

    const currentImage = images[currentImageIndex];

    return (
        <MainImageStyled 
            alt=""
            onLoad={handleImageLoaded}
            src={currentImage.isLoaded ? currentImage.src : currentImage.blurrySrc}
        />
    )
}, [buildLoadingState("images", null)], { marginTop: 0 });

const Home = () => {

    const context = useContext(GlobalContext);
    const [images, setImages] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const diaporamaTimeoutRef = useRef(null);

    useCancellable(() => {
        context.dataProvider.getImageDefaultSelection().then(images => {
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
        });
        return () => {
            clearTimeout(diaporamaTimeoutRef.current);
        }
    }, [context.dataProvider], context.dataProvider);

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
        } else {
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