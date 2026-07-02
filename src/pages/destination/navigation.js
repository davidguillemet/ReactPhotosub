import React from 'react';
import {isMobile} from 'react-device-detect';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import {
    formatDate,
    formatDateShort,
    useLanguage,
    useTranslation,
    destinationTitle,
    getThumbnailSrc
} from 'utils';
import { PageHeader, Paragraph } from 'template/pageTypography';
import DestinationLink from 'components/destinationLink';
import lazyComponent from 'components/lazyComponent';
import { NoWrapAndEllipsis } from 'template/pageTypography';
import { useResizeObserver } from 'components/hooks';
import RegionPath from 'components/regionPath';

const MainImageStyled = styled('img')({
    display: 'block',
    minHeight: '100%',
    minWidth : '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'cover', // prevent image from shrinking when window width is too small
    filter: 'blur(1px)',
    transition: 'transform .9s ease'
});

const NavigationItem = ({destination, type, caption}) => {
    const { language } = useLanguage();
    const navigationResizeObserver = useResizeObserver();

    const destinationDate = new Date(destination.date);
    const dateFormatter = isMobile ? formatDateShort : formatDate;
    const formattedDate = dateFormatter(destinationDate, language);

    const destinationCover = React.useMemo(() => getThumbnailSrc({
        src: destination.cover,
        sizeRatio: 600 / 400, // cover always landscape
        version: destination.cover_version
    }, navigationResizeObserver.width), [destination, navigationResizeObserver.width]);

    return (
        <DestinationLink destination={destination}>
            <Card
                ref={navigationResizeObserver.ref}
                sx={{
                    position: "relative",
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: type === "left" ? "flex-start" : "flex-end",
                    alignItems: 'center',
                    width: "100%",
                    py: 1,
                    px: 1,
                    height: 200,
                    border: theme => `1px solid ${theme.palette.text.muted}40`,
                    borderRadius: theme => theme.shape.borderRadius,
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        padding: 0,
                        overflow: 'hidden',
                        zIndex: 0,
                        opacity: 0.2,
                        overflowX: 'hidden',
                        overflowY: 'hidden',
                        transition: 'opacity .35s, transform .9s ease',
                        '&:hover': {
                            opacity: 0.6,
                        },
                        [`&:hover img`]: {
                            transform: 'scale(1.1)'
                        }
                    }}
                >
                    <MainImageStyled
                        alt=""
                        src={destinationCover}
                    />
                </Box>
                <Stack
                    sx={{
                        alignItems: type === "left" ? "flex-start" : "flex-end",
                        width: "100%",
                        overflow: "hidden",
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}
                >
                    {
                        type === "left" ?
                        <WestIcon sx={{
                                mx: 1,
                                ml: 0,
                                zIndex: 1,
                                pointerEvents: 'none'
                            }}
                        /> :
                        <EastIcon sx={{
                                mx: 1,
                                mr: 0,
                                zIndex: 1,
                                pointerEvents: 'none'
                            }}
                        />
                    }
                    <PageHeader
                        sx={{
                            my: 0,
                            fontWeight: "300",
                            textAlign: type,
                            ...NoWrapAndEllipsis
                        }}
                        variant={isMobile ? "h6" : "h4"}
                    >
                        {destinationTitle(destination, language)}
                    </PageHeader>
                    <Paragraph sx={{my: 0, fontWeight: "100", textAlign: type, ...NoWrapAndEllipsis}}>
                        { formattedDate }
                    </Paragraph>
                    <RegionPath
                        destination={destination}
                        justifyContent={type === 'left' ? 'flex-start' : 'flex-end'}
                    />
                </Stack>
            </Card>
        </DestinationLink>
    )
}

const Navigation = lazyComponent(({destination}) => {
    const t = useTranslation("pages.destination");
    return (
        <Grid container spacing={0.5} sx={{width: '100%'}}>
            <Grid size={6}>
                {
                    destination.prev && <NavigationItem destination={destination.prev} type="left" caption={t("btn:prevDestination")}/>
                }
            </Grid>
            <Grid size={6}>
                {
                    destination.next && <NavigationItem destination={destination.next} type="right" caption={t("btn:nextDestination")}/>
                }
            </Grid>
        </Grid>
    );
}, { height: 90 });

export default Navigation;
