import React, { useLayoutEffect, useRef } from 'react';
import { useNavigate } from "react-router";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '@mui/material';
import { PageHeader, Paragraph } from 'template/pageTypography';
import RegionPath from 'components/regionPath';
import { gsap } from "gsap";
import { useGSAP } from '@gsap/react';
import { parseImageDescription, formatDateShort, useLanguage, destinationTitle, useTranslation } from 'utils';
import { useDetailsState } from './useDetailsState';

gsap.registerPlugin(useGSAP);

const ImageDetails = ({image}) => {

    const navigate = useNavigate();
    const { collapsed, toggleCollapsed } = useDetailsState();
    const { language } = useLanguage();
    const t = useTranslation("pages.home");
    const imageCaption = React.useMemo(() => {
        const captions = parseImageDescription(image)[language];
        if (!captions || captions.length === 0) {
            // An image without description.
            return null;
        }
        return `${captions[0].vernacular[0]} (${captions[0].scientific})`;
    }, [image, language]);

    const container = useRef();
    const buttonContainer = useRef();

    const { contextSafe } = useGSAP();

    const destination = image.destination;

    useLayoutEffect(() => {
        if (collapsed) {
            const contentWidth = container.current.offsetWidth - buttonContainer.current.offsetWidth;
            gsap.set(container.current, { left: -contentWidth });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleDetails = contextSafe(() => {
        if (collapsed) {
            gsap.to(container.current, {
                left: 0,
                duration: 0.4,
                ease: 'bounce.out'
            });
        } else {
            const contentWidth = container.current.offsetWidth - buttonContainer.current.offsetWidth;
            gsap.to(container.current, {
                left: -contentWidth,
                duration: 0.4,
                ease: 'bounce.out'
            });
        }
        toggleCollapsed();
    }, [collapsed]);

    const goToDestination = React.useCallback(() => {
        navigate(`/destinations/${destination.path}`);
    }, [destination, navigate]);

    return (
        <Box
            ref={container}
            sx={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                bottom: 100, // Footer height + some margin
                left: 0,
                padding: 1,
                background: theme => `${theme.palette.background.paper}77`,
                backdropFilter: 'blur(10px)',
                color: theme => theme.palette.text.secondary,
                border: theme => `1px solid ${theme.palette.divider}`,
                borderLeftWidth: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                transition: 'background 0.3s',
                '&:hover': {
                    background: theme => `${theme.palette.background.paper}99`,
                    backdropFilter: 'blur(14px)',
                },
                zIndex: theme => theme.zIndex.drawer,
                maxWidth: 'calc(100vw)',
                width: 'fit-content',
            }}
        >
            <Stack
                direction="row"
                spacing={0}
                sx={{
                    width: '100%',
                    alignItems: 'stretch',
                    justifyContent: 'space-between'
                }}
            >
                <Box
                    sx={{
                        padding: 1,
                        textAlign: 'left',
                        overflow: 'hidden',
                    }}
                >
                    { imageCaption && <Paragraph sx={{mb: 0.5, mt: 0}}>{imageCaption}</Paragraph> }
                    <Stack direction="row" spacing={2} sx={{alignItems: 'baseline', justifyContent: 'flex-start'}}>
                        <PageHeader sx={{mb: 0}}>{destinationTitle(destination, language)}</PageHeader>
                        <Paragraph sx={{mb: 0}}>{formatDateShort(new Date(destination.date), language)}</Paragraph>
                    </Stack>
                    <RegionPath
                        destination={destination}
                        justifyContent="flex-start"
                    />
                    <Button
                        sx={{ mt: 1 }}
                        onClick={goToDestination}
                        endIcon={<ArrowForwardIcon />}
                    >
                        {t('btn:viewDestination')}
                    </Button>
                </Box>
                <Box
                    ref={buttonContainer}
                    sx={{
                        display: 'flex',
                        borderLeft: theme => `1px solid ${theme.palette.divider}`,
                        alignItems: 'center',
                    }}
                >
                    <IconButton
                        variant="noBorder"
                        onClick={toggleDetails}
                    >
                        { collapsed ? <ArrowRightIcon fontSize="small"/> : <ArrowLeftIcon fontSize="small"/> }
                    </IconButton>
                </Box>
            </Stack>
        </Box>
    );
};

export default ImageDetails;
