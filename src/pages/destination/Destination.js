import React, { useState, useCallback } from 'react';
import { useParams } from "react-router-dom";
import {isMobile} from 'react-device-detect';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import Grow from '@material-ui/core/Grow';
import Stack from '@material-ui/core/Stack';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ArrowBackIosNewIcon from '@material-ui/icons/ArrowBackIosNew';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Chip from '@material-ui/core/Chip';
import { formatDate, formatDateShort } from '../../utils';
import Gallery from '../../components/gallery';
import { PageTitle, PageSubTitle, PageHeader, Paragraph } from '../../template/pageTypography';
import LocationDialog from './LocationDialog';
import LazyDialog from '../../dialogs/LazyDialog';
import { withLoading, buildLoadingState } from '../../components/loading';
import { useGlobalContext } from '../../components/globalContext';
import DestinationLink from '../../components/destinationLink';
import { VerticalSpacing } from '../../template/spacing';
import { useVisible } from '../../components/hooks';

const RegionChip = ({region}) => {

    return (
        <Chip label={region.title} sx={{mx: 0.5, my: 0.5}} variant='outlined' />
    )
}

const RegionPath = ({regions}) => {

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                my: 1
            }}
        >
        { regions.slice(0).reverse().map(region => <RegionChip key={region.id} region={region} />) }
        </Box>
    );
}

const ImageCount = withLoading(({images}) => {
    return (
        <Chip
            icon={<PhotoLibraryIcon />}
            label={`${images.length} images`}
            sx={{
                px: 1
            }}>
        </Chip>
    )
}, [buildLoadingState("images", [null, undefined])], { size: 20, marginTop: 0 });

const NavigationItem = ({destination, type}) => {
    if (destination === null) {
        return null;
    }
    return (
        <DestinationLink destination={destination}>
            <Paper
                elevation={4}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: type === "next" ? "flex-start" : "flex-end",
                    alignItems: 'center',
                    py: 1
                }}
            >
                {
                    type === "next" && <ArrowBackIosNewIcon sx={{mx: 1, fontSize: { xs: 20, md: 40 }}}></ArrowBackIosNewIcon>
                }
                <Stack sx={{ alignItems: type === "next" ? "flex-start" : "flex-end"}}>
                    <PageHeader sx={{my: 0, fontWeight: "300"}} variant={isMobile ? "h6" : "h4"}>{destination.title}</PageHeader>
                    <Paragraph sx={{my: 0, fontWeight: "100"}}>
                        {
                            isMobile ?
                            formatDateShort(new Date(destination.date)) :
                            formatDate(new Date(destination.date))
                        }
                    </Paragraph>
                </Stack>
                {
                    type === "prev" && <ArrowForwardIosIcon sx={{mx: 1, fontSize: { xs: 20, md: 40 }}}></ArrowForwardIosIcon>
                }
            </Paper>
        </DestinationLink>
    )
}

const Navigation = ({destination}) => {
    return (
        <Grow in={true} timeout={1000}>
            <Grid container spacing={{ xs: 1, md: 2}} sx={{width: '100%'}}>
                <Grid item xs={6}>
                    <NavigationItem destination={destination.next} type="next"/>
                </Grid>
                <Grid item xs={6}>
                    <NavigationItem destination={destination.prev} type="prev"/>
                </Grid>
            </Grid>
        </Grow>
    )
}

const BottomNavigation = ({destination}) => {

    const { isVisible, ref: navigationRef } = useVisible();
    
    return (
        <Box ref={navigationRef} sx={{width: '100%'}}>
            {
                isVisible &&
                <Navigation destination={destination} />
            }
        </Box>
    ) 
}

const DestinationDisplay = withLoading(({destination, year, title}) => {

    const context = useGlobalContext();
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [locationOpen, setLocationOpen] = useState(false);
    const { data: images } = context.useFetchDestinationImages(year, title);
    const [ galleryIsReady, setGalleryIsReady ] = useState(false);

    const handleCloseLocation = useCallback(() => {
        setLocationOpen(false);
    }, []);

    const handleOpenLocation = () => {
        setLocationOpen(true);
    }

    const toggleOpenSummary = useCallback(() => {
        setSummaryOpen(open => !open);
    }, []);

    const onGalleryIsReady = useCallback(() => {
        setGalleryIsReady(true);
    }, [])

    return (
        <React.Fragment>
            <VerticalSpacing factor={2} />

            <Navigation destination={destination}/>

            <PageTitle sx={{mb: 0}}>{destination.title}</PageTitle>
            <PageSubTitle sx={{mt: 0, mb: 1}}>{formatDate(new Date(destination.date))}</PageSubTitle>
            <RegionPath regions={destination.region_path}></RegionPath>
            <ImageCount images={images}/>

            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
            }}>
                <Button sx={{m: 1}} onClick={toggleOpenSummary} variant="outlined">Voir le Résumé</Button>
                <Button sx={{m: 1}} onClick={handleOpenLocation} variant="outlined">Voir le lieu</Button>
            </Box>

            <LazyDialog
                open={summaryOpen}
                handleClose={toggleOpenSummary}
                title={`${destination.title} - ${formatDate(new Date(destination.date))}`}
                path={`summaries/${destination.path}`}
            />

            <LocationDialog
                destination={destination}
                open={locationOpen}
                handleClose={handleCloseLocation}
            />

            <Gallery images={images} onReady={onGalleryIsReady} />

            <VerticalSpacing factor={2} />

            {
                galleryIsReady &&
                <BottomNavigation destination={destination} />
            }

        </React.Fragment>
    );
}, [buildLoadingState("destination", [null, undefined])]);

const Destination = () => {
    const context = useGlobalContext();
    const { year, title } = useParams();
    const { data } = context.useFetchDestinationHeader(year, title);
    return <DestinationDisplay destination={data} year={year} title={title} />
};

export default Destination;