import React, { useState, useCallback, useMemo, useEffect, lazy } from 'react';
import { useParams } from "react-router-dom";
import {isMobile} from 'react-device-detect';
import Stack from '@material-ui/core/Stack';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Chip from '@material-ui/core/Chip';
import { formatDate, formatDateShort } from '../../utils';
import Gallery from '../../components/gallery';
import { PageTitle, PageHeader, Paragraph } from '../../template/pageTypography';
import LazyDialog from '../../dialogs/LazyDialog';
import { withLoading, buildLoadingState } from '../../components/loading';
import { useGlobalContext } from '../../components/globalContext';
import DestinationLink from '../../components/destinationLink';
import { VerticalSpacing } from '../../template/spacing';
import DestinationsMap from '../../components/map';
import lazyComponent from '../../components/lazyComponent';
import RelatedDestinations from './relatedDestinations';

const RegionChip = ({region}) => {

    return (
        <Chip label={region.title} sx={{m: 0, mr: 0.5, mt: 0.5}} color="primary" />
    )
}

const RegionPath = ({regions}) => {

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                my: 1,
                width: "100%"
            }}
        >
        { regions.slice(0).reverse().map(region => <RegionChip key={region.id} region={region} />) }
        </Box>
    );
}

const NavigationItem = ({destination, type, caption}) => {
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
                    justifyContent: type === "left" ? "flex-start" : "flex-end",
                    alignItems: 'center',
                    py: 1,
                    backgroundColor: (theme) => theme.palette.primary.light
                }}
            >
                {
                    type === "left" && <ArrowBackIcon sx={{mx: 1, fontSize: { xs: 20, md: 40, color: "white" }}} ></ArrowBackIcon>
                }
                <Stack sx={{ alignItems: type === "left" ? "flex-start" : "flex-end" }}>
                    <PageHeader sx={{my: 0, fontWeight: "300", color: "white"}} variant={isMobile ? "h6" : "h4"}>{destination.title}</PageHeader>
                    <Paragraph sx={{my: 0, fontWeight: "100", color: "white"}}>
                        {
                            isMobile ?
                            formatDateShort(new Date(destination.date)) :
                            formatDate(new Date(destination.date))
                        }
                    </Paragraph>
                </Stack>
                {
                    type === "right" && <ArrowForwardIcon sx={{mx: 1, fontSize: { xs: 20, md: 40, color: "white" }}}></ArrowForwardIcon>
                }
            </Paper>
        </DestinationLink>
    )
}

const Navigation = lazyComponent(({destination}) => {
    return (
        <Grid container spacing={{ xs: 1, md: 2}} sx={{width: '100%'}}>
            <Grid item xs={6}>
                <NavigationItem destination={destination.next} type="left" caption="Suivant"/>  
            </Grid>
            <Grid item xs={6}>
                <NavigationItem destination={destination.prev} type="right" caption="Précédent"/>
            </Grid>
        </Grid>
    )
});

const DestinationDetails = ({destination}) => {

    const [summaryOpen, setSummaryOpen] = useState(false);
    const [hasSummary, setHasSummary] = useState(false);
    const formatedDate = useMemo(() => formatDate(new Date(destination.date)), [destination]);

    const toggleOpenSummary = useCallback(() => {
        setSummaryOpen(open => !open);
    }, []);

    useEffect(() => {
        import(`../../dialogs/summaries/${destination.path}`)
        .then(() => setHasSummary(true))
        .catch(() => setHasSummary(false)); 
    }, [destination]);

    return (
        <Paper
            elevation={4}
            sx={{
                position: "absolute",
                left: 10,
                bottom: 10,
                py: 1,
                px: isMobile ? 4 : 6,
                backgroundColor: (theme) => theme.palette.primary.light,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
            }}>
            <PageTitle sx={{m: 0, color: "white"}}>{destination.title}</PageTitle>
            <PageHeader sx={{m: 0, color: "white"}}>{formatedDate}</PageHeader>
            {
                hasSummary &&
                <Button sx={{m: 0, mt: 1, px: 1}} size={isMobile ? "small": "medium"} onClick={toggleOpenSummary} variant="contained">Voir le Résumé</Button>
            }
            <LazyDialog
                open={summaryOpen}
                handleClose={toggleOpenSummary}
                title={`${destination.title} - ${formatedDate}`}
                path={`summaries/${destination.path}`}
            />
        </Paper>
    );
}

const DestinationDisplay = withLoading(({destination, year, title}) => {

    const context = useGlobalContext();
    const { data: images } = context.useFetchDestinationImages(year, title);
    const [ galleryIsReady, setGalleryIsReady ] = useState(false);
    const destinations = useMemo(() => [destination], [destination]);

    const onGalleryIsReady = useCallback(() => {
        setGalleryIsReady(true);
    }, [])

    return (
        <React.Fragment>

            <RegionPath regions={destination.region_path}></RegionPath>

            <Box sx={{ width: "100%", height: isMobile ? "300px" : "400px", position: "relative" }}>
                <DestinationsMap destinations={destinations} />
                <DestinationDetails destination={destination} />
            </Box>

            <VerticalSpacing factor={2} />

            <Navigation destination={destination}/>

            <VerticalSpacing factor={2} />

            <Gallery images={images} onReady={onGalleryIsReady} />

            <VerticalSpacing factor={4} />

            {
                galleryIsReady &&
                <Navigation destination={destination} />
            }

            <VerticalSpacing factor={4} />

            {
                galleryIsReady &&
                <RelatedDestinations destination={destination} />
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