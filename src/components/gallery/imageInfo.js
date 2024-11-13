import React from 'react';
import { gsap } from "gsap";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import {isMobile} from 'react-device-detect';
import ImageDescription from '../imageDescription';
import ImageDestinationLink from './imageDestinationLink';
import { Alert, Stack } from '@mui/material';
import { useTranslation } from 'utils';

const imageInfoId = "imageInfoId";
const imageInfoAnimationDuration = 0.5;

const ImageInfo = ({image, displayDestination, style, container, visible}) => {

    const t = useTranslation("components.gallery");
    const overlayRef = React.useRef(null);
    const paperRef = React.useRef();

    const showAction = React.useRef(null);
    const hiddeAction = React.useRef(null);
    const effectFirstRoundTrip = React.useRef(true);

    React.useEffect(() => {
        if (!container) {
            return;
        }
        if (effectFirstRoundTrip.current === true) {
            effectFirstRoundTrip.current = false;
            return;
        }
        const selector = gsap.utils.selector(container);
        if (visible) {
            if (hiddeAction.current !== null) {
                hiddeAction.current.kill();
                hiddeAction.current = null;
            }
            overlayRef.current.classList.add('visible');
            showAction.current = gsap.timeline();
            showAction.current.to(selector(`#${imageInfoId}`), { duration: imageInfoAnimationDuration, opacity: 1 })
            .then(() => {
                showAction.current = null;
            })
        } else {
            hiddeAction.current = gsap.timeline();
            hiddeAction.current.to(selector(`#${imageInfoId}`), { duration: imageInfoAnimationDuration, opacity: 0 })
            .then(() => {
                hiddeAction.current = null;
                if (!visible) {
                    overlayRef.current.classList.remove('visible');
                }
            });
        }
    }, [visible, container]);

    React.useEffect(() => {
        paperRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [image]);

    return (
        <Box
            ref={overlayRef}
            id={imageInfoId}
            sx={{
                ...style,
                position: 'absolute',
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                display: 'none',
                flexDirection: 'column',
                py: 0.5,
                textAlign: 'center',
                bgcolor: 'rgb(0,0,0,0.4)',
                opacity: 0,
                '&.visible' : {
                    display: 'flex'
                }
            }}
        >
            <Paper
                ref={paperRef}
                elevation={4}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 0,
                    bgcolor: 'rgb(0,0,0,0.5)',
                    position: 'absolute',
                    overflowY: 'auto',
                    top: '50%',
                    left: '50%',
                    maxHeight: '100%',
                    transform: 'translateY(-50%) translateX(-50%)',
                    ...(isMobile ? {
                        width: '100%'
                    } : {
                        minWidth: '70%'
                    })
                }}
            >
                <Stack
                    direction='column'
                    alignItems='center'
                    spacing={1}
                    sx={{m: 1, p: 0}}
                >
                    <ImageDescription image={image} />
                    {
                        displayDestination &&
                        <Box
                            sx={{
                                p: 0,
                                m: 0,
                                height: "24px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <ImageDestinationLink image={image} />
                        </Box>
                    }
                    <Box>
                    {
                        image.tags ?
                        image.tags.map(tag => {
                            return (
                            <Chip color="secondary" key={tag} label={tag} size="small" sx={{marginRight: 0.5, marginTop: 0.5 }} />
                            )
                        }) :
                        <Alert severity='warning'>{t("info:noTags")}</Alert>
                    }
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}

export default ImageInfo;