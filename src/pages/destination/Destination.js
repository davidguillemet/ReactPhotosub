import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from "react-router-dom";
import {isMobile} from 'react-device-detect';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Chip from '@mui/material/Chip';
import { formatDate, formatDateShort } from '../../utils';
import Gallery from '../../components/gallery';
import { PageSubTitle, PageHeader, Paragraph } from '../../template/pageTypography';
import LazyDialog from '../../dialogs/LazyDialog';
import { withLoading, buildLoadingState } from '../../components/hoc';
import { useGlobalContext } from '../../components/globalContext';
import DestinationLink from '../../components/destinationLink';
import { VerticalSpacing } from '../../template/spacing';
import DestinationsMap from '../../components/map';
import lazyComponent from '../../components/lazyComponent';
import RelatedDestinations from './relatedDestinations';
import NotFound from '../notFound';
import { HelmetDestination } from '../../template/seo';
import { useReactQuery } from '../../components/reactQuery';

const RegionChip = ({region}) => {

    return (
        <Chip label={region.title} sx={{m: 0, mr: 0.5, mt: 0.5}} color="primary" variant="outlined"/>
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

    const destinationDate = new Date(destination.date);
    const formattedDate =
        isMobile ?
        formatDateShort(destinationDate) :
        formatDate(destinationDate);

    const noWrapAndEllipsis = {
        whiteSpace: "nowrap",
        width: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis"
    };

    return (
        <DestinationLink destination={destination}>
            <Paper
                elevation={2}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: type === "left" ? "flex-start" : "flex-end",
                    alignItems: 'center',
                    width: "100%",
                    py: 1,
                    px: 1,
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderColor: (theme) => theme.palette.grey[200]
                }}
            >
                {
                    type === "left" &&
                    <ArrowBackIosIcon sx={{
                            mx: 1,
                            fontSize: { xs: 20, md: 40},
                            ml: 0
                        }}
                    />
                }
                <Stack sx={{ alignItems: type === "left" ? "flex-start" : "flex-end", width: "100%", overflow: "hidden" }}>
                    <PageHeader
                        sx={{
                            my: 0,
                            fontWeight: "300",
                            textAlign: type,
                            ...noWrapAndEllipsis
                        }}
                        variant={isMobile ? "h6" : "h4"}
                    >
                        {destination.title}
                    </PageHeader>
                    <Paragraph sx={{my: 0, fontWeight: "100", textAlign: type, ...noWrapAndEllipsis}}>
                        { formattedDate }
                    </Paragraph>
                </Stack>
                {
                    type === "right" &&
                    <ArrowForwardIosIcon sx={{
                        mx: 1,
                        fontSize: { xs: 20, md: 40 },
                        mr: 0
                    }} />
                }
            </Paper>
        </DestinationLink>
    )
}

const Navigation = lazyComponent(({destination}) => {
    return (
        <Grid container spacing={{ xs: 0.5, md: 1}} sx={{width: '100%'}}>
            <Grid item xs={6}>
                <NavigationItem destination={destination.next} type="left" caption="Suivant"/>  
            </Grid>
            <Grid item xs={6}>
                <NavigationItem destination={destination.prev} type="right" caption="Précédent"/>
            </Grid>
        </Grid>
    )
}, { height: 90 });

const DestinationDetails = ({destination}) => {

    const [summaryOpen, setSummaryOpen] = useState(false);
    const [hasSummary, setHasSummary] = useState(false);
    const formattedDate = useMemo(() => formatDate(new Date(destination.date)), [destination]);

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
                px: isMobile ? 1 : 4,
                backgroundColor: (theme) => theme.palette.primary.light,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
            }}>
            <HelmetDestination destination={destination} />
            <PageSubTitle component="h1" sx={{m: 0, color: "white", whiteSpace: "nowrap", fontWeight: 300}}>{destination.title}</PageSubTitle>
            <PageHeader sx={{m: 0, color: "white"}}>{formattedDate}</PageHeader>
            {
                destination.link &&
                <Chip color="primary" size="small" label={destination.location} component="a" href={destination.link} clickable target="_blank" />
            }
            {
                hasSummary &&
                <Button sx={{m: 0, mt: 1, px: 1}} size={isMobile ? "small": "medium"} onClick={toggleOpenSummary} variant="contained">Voir le Résumé</Button>
            }
            <LazyDialog
                open={summaryOpen}
                handleClose={toggleOpenSummary}
                title={`${destination.title} - ${formattedDate}`}
                path={`summaries/${destination.path}`}
            />
        </Paper>
    );
}

const DestinationDisplay = withLoading(({destination, year, title}) => {

    const context = useGlobalContext();
    const { data: images } = useReactQuery(context.useFetchDestinationImages, [year, title]);
    const [ galleryIsReady, setGalleryIsReady ] = useState(false);
    const destinations = useMemo(() => [destination], [destination]);

    const onGalleryIsReady = useCallback(() => {
        setGalleryIsReady(true);
    }, [])

    return (
        <React.Fragment>
            <RegionPath regions={destination.regionpath}></RegionPath>

            <Box sx={{ width: "100%", height: isMobile ? "300px" : "400px", position: "relative" }}>
                <DestinationsMap destinations={destinations} />
                <DestinationDetails destination={destination} />
            </Box>

            <VerticalSpacing factor={2} />

            <Navigation destination={destination}/>

            <VerticalSpacing factor={2} />

            <Gallery
                images={images}
                onReady={onGalleryIsReady}
                displayDestination={false}
                sort="asc"
                pushHistory={true}
            />

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
    const { data, isError, error} = useReactQuery(context.useFetchDestinationHeader, [year, title]);
    if (isError === true && error.response && error.response.status === 404) {
        return <NotFound />
    } else {
        return <DestinationDisplay destination={data} year={year} title={title} />
    }
};

export default Destination;