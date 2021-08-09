import React, { useEffect, useState, useRef, useCallback } from 'react';
import { styled } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Link } from 'react-router-dom';

import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles.css';

import {unstable_batchedUpdates} from 'react-dom';

import dataProvider from '../../dataProvider';
import { uniqueID, shuffleArray, getBlurrySrc, isBlurrySrc } from '../../utils/utils';
import PageTitle from '../../template/pageTitle';
import { Typography } from '@material-ui/core';

const _diaporamaInterval = 10000;

const MainImage = styled('img')({
    display: 'block',
    minHeight: '100%',
    minWidth : '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'cover', // prevent image from shrinking when window width is too small
    opacity: 0,
    transition: 'opacity 1.0s',
    '&.loaded': {
        opacity: 1
    }
});

const StartLink = styled(Link)(({theme}) => ({
    textDecoration: 'none',
    color: theme.palette.text.primary,
    backgroundColor: '#dddddd',
    padding: 5,
    borderRadius: 3,
    transition: 'color 0.5s, backgroundColor 0.5s',
    '&:hover': {
        backgroundColor: theme.palette.text.secondary,
        color: '#dddddd'
    }
}));

const Subtitle = (props) => {
    return (
        <Typography
            variant="subtitle1"
            style={{
                color: '#cccccc',
                textAlign: 'center',
                fontSize: 18
            }}
        >
            {props.children}
        </Typography>
    );
}

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

    function onCloseModal() {
        // TODO??
    }

    const currentImage = images !== null ? images[currentImageIndex] : null;

    return (
        <Modal
            open={true}
            onClose={onCloseModal}
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 0,
                style: {
                    backgroundColor: '#fff'
                }
            }}
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
                <TransitionGroup component={null}>
                    <CSSTransition
                        key={currentImageIndex}
                        timeout={500}
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
                    style={{
                        position: 'absolute',
                        background: 'rgba(0,0,0,0.3)',
                        padding: 15,
                        margin: 15,
                        width: '95%',
                        maxWidth: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <PageTitle
                        sx={{
                            color: '#cccccc',
                            textAlign: 'center',
                            fontWeight: '400'
                        }}
                    >
                        Bienvenue
                    </PageTitle>
                    <Subtitle>Bienvenue sur ce site de photographie sous-marine.</Subtitle>
                    <Subtitle>Je vous propose une immersion au cœur des océans, au travers de clichés réalisés lors de plongées sur quelques-uns des plus beaux sites au monde...</Subtitle>
                    <Subtitle>Alors, prêt à <StartLink to="/destinations">démarrer l'aventure</StartLink> ?</Subtitle>
                </Paper>
            </Box>
        </Modal>
    )
};

export default Home;