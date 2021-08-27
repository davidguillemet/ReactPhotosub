import React, { useEffect, useState, useRef, useCallback } from 'react';
import { styled } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles.css';

import {unstable_batchedUpdates} from 'react-dom';

import dataProvider from '../../dataProvider';
import { uniqueID, shuffleArray, getBlurrySrc, isBlurrySrc } from '../../utils';
import { PageSubTitle, Paragraph } from '../../template/pageTypography';

const _diaporamaInterval = 10000;

const MainImage = styled('img')({
    display: 'block',
    minHeight: '100%',
    minWidth : '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'cover' // prevent image from shrinking when window width is too small
});

const Home = () => {

    const [images, setImages] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const diaporamaTimeoutRef = useRef(null);

    useEffect(() => {
        dataProvider.getImageDefaultSelection().then(images => {
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
    }, []);

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

    const currentImage = images !== null ? images[currentImageIndex] : null;

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
                            {
                                images === null ?
                                <CircularProgress /> :
                                <MainImage
                                    alt=""
                                    onLoad={handleImageLoaded}
                                    src={currentImage.isLoaded ? currentImage.src : currentImage.blurrySrc}
                                />
                            }
                        </Box>
                    </CSSTransition>
                </TransitionGroup>
                <Paper elevation={6}
                    sx={{
                        position: 'absolute',
                        background: 'rgba(0,0,0,0.4)',
                        p: 2,
                        m: 2,
                        width: '95%',
                        maxWidth: 600,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <PageSubTitle sx={{ fontWeight: "400", color: '#fff' }}>Bienvenue</PageSubTitle>
                    <Paragraph sx={{ color: '#fff', my: 0.5, textAlign: "start" }}>Bienvenue sur ce site de photographie sous-marine.</Paragraph>
                    <Paragraph sx={{ color: '#fff', my: 0.5, textAlign: "start" }}>Je vous propose une immersion au cœur des océans, au travers de clichés réalisés lors de plongées sur quelques-uns des plus beaux sites au monde...</Paragraph>
                    <Paragraph sx={{ color: '#fff', my: 0.5, textAlign: "start" }}>Prêt à démarrer l'aventure ?</Paragraph>
                </Paper>
                </React.Fragment>
    )
};

export default Home;