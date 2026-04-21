import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLoaderData } from "react-router";
import {isMobile} from 'react-device-detect';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Chip from '@mui/material/Chip';
import { formatDate, formatDateShort, useLanguage, regionTitle, useTranslation, destinationTitle, getPropFromLanguage } from 'utils';
import Gallery from 'components/gallery';
import { PageSubTitle, PageHeader, Paragraph } from 'template/pageTypography';
import { LazyDialog } from 'dialogs';
import DestinationLink from 'components/destinationLink';
import { VerticalSpacing } from 'template/spacing';
import { DestinationsMap } from 'components/map';
import lazyComponent from 'components/lazyComponent';
import RelatedDestinations from './relatedDestinations';
import { HelmetDestination } from 'template/seo';
import { useAuthContext } from 'components/authentication';
import GroupBuilderFactory from './groupBuilder';
import { DestinationGalleryContextProvider } from './admin/DestinationGalleryContext';
import { SubGalleryHeaderComponent } from './admin/SubGalleryHeaderComponent';
import { PublicationAlert } from 'components/publication';
import DestinationAdminTools from './admin/DestinationAdminTools';
import { NoWrapAndEllipsis } from 'template/pageTypography';
import { ReactRouterAwaiter } from 'components/reactRouter';

const RegionChip = ({region}) => {
    const { language } = useLanguage();

    return (
        <Chip label={regionTitle(region, language)} sx={{m: 0, mr: 0.5}} color="secondary" variant="outlined"/>
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
    const { language } = useLanguage();
    if (destination === null) {
        return null;
    }

    const destinationDate = new Date(destination.date);
    const dateFormatter = isMobile ? formatDateShort : formatDate;
    const formattedDate = dateFormatter(destinationDate, language);

    return (
        <DestinationLink destination={destination}>
            <Paper
                elevation={3}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: type === "left" ? "flex-start" : "flex-end",
                    alignItems: 'center',
                    width: "100%",
                    py: 1,
                    px: 1
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
                            ...NoWrapAndEllipsis
                        }}
                        variant={isMobile ? "h6" : "h4"}
                    >
                        {destinationTitle(destination, language)}
                    </PageHeader>
                    <Paragraph sx={{my: 0, fontWeight: "100", textAlign: type, ...NoWrapAndEllipsis}}>
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
    const t = useTranslation("pages.destination");
    return (
        <Grid container spacing={{ xs: 0.5, md: 1}} sx={{width: '100%'}}>
            <Grid item xs={6}>
                <NavigationItem destination={destination.prev} type="left" caption={t("btn:prevDestination")}/>
            </Grid>
            <Grid item xs={6}>
                <NavigationItem destination={destination.next} type="right" caption={t("btn:nextDestination")}/>
            </Grid>
        </Grid>
    )
}, { height: 90 });

const DestinationDetails = ({destination}) => {

    const t = useTranslation("pages.destination");
    const { language } = useLanguage();
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [hasSummary, setHasSummary] = useState(false);
    const formattedDate = useMemo(() => formatDate(new Date(destination.date), language), [destination, language]);

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
                backgroundColor: (theme) => theme.palette.primary.main,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
            }}>
            <HelmetDestination destination={destination} />
            <PageSubTitle component="h1" sx={{m: 0, color: theme => theme.palette.primary.contrastText, whiteSpace: "nowrap", fontWeight: 300}}>{destinationTitle(destination, language)}</PageSubTitle>
            <PageHeader sx={{m: 0, color: theme => theme.palette.primary.contrastText}}>{formattedDate}</PageHeader>
            {
                destination.link &&
                <Chip color="primary" size="small" label={destination.location} component="a" href={destination.link} clickable target="_blank" />
            }
            {
                hasSummary &&
                <Button sx={{m: 0, mt: 1, px: 1}} size={isMobile ? "small": "medium"} onClick={toggleOpenSummary}>{t("btn:seeSummary")}</Button>
            }
            <LazyDialog
                open={summaryOpen}
                handleClose={toggleOpenSummary}
                title={`${destinationTitle(destination, language)} - ${formattedDate}`}
                path={`summaries/${destination.path}`}
            />
        </Paper>
    );
}

const getGroupDestinations = (destination, galleries, language) => {
    if (!galleries) {
        return [];
    }
    return galleries
        .filter((gallery) => gallery.location !== null) // Keep galleries with location
        .map((gallery) => ({
            [getPropFromLanguage("title", language)]: gallery.location_title,
            latitude: gallery.latitude,
            longitude: gallery.longitude,
            date: destination.date,
            hasImages: gallery.hasImages
        }));
}

const DestinationGallery = ({destination, destinationImages, onGalleryIsReady}) => {
    const { language } = useLanguage();
    const authContext = useAuthContext();
    const { images, galleries } = destinationImages;
    const groupBuilder = React.useMemo(() => GroupBuilderFactory(destination, galleries, language), [destination, galleries, language]);

    return (
        <Gallery
            images={images}
            onReady={onGalleryIsReady}
            displayDestination={false}
            sort="asc"
            pushHistory={true}
            groupBuilder={groupBuilder}
            groupHeaderEndComponent={authContext.admin === true ? SubGalleryHeaderComponent : null}
        />
    )
};

const DestinationMap = ({destination, destinationImages}) => {
    const { language } = useLanguage();
    const { galleries } = destinationImages;
    const groupDestinations = React.useMemo(() => getGroupDestinations(destination, galleries, language), [destination, galleries, language]);
    const destinations = useMemo(() => [destination], [destination]);
    return <DestinationsMap destinations={groupDestinations.length > 0 ? groupDestinations : destinations} />
};

const DestinationDisplay = ({destination}) => {

    const { destinationImages } = useLoaderData();
    const [ galleryIsReady, setGalleryIsReady ] = useState(false);

    const onGalleryIsReady = useCallback(() => {
        setGalleryIsReady(true);
    }, []);

    return (
        <React.Fragment>
            <PublicationAlert destination={destination} sx={{width: "100%", mt: 1}} />
            <RegionPath regions={destination.regionpath}></RegionPath>

            <Box sx={{ width: "100%", height: isMobile ? "300px" : "400px", position: "relative" }}>
                <ReactRouterAwaiter value={destinationImages} fallback={<DestinationsMap destinations={[destination]} />}>
                    {destinationImages => <DestinationMap destination={destination} destinationImages={destinationImages} />}
                </ReactRouterAwaiter>
                <DestinationDetails destination={destination} />
            </Box>

            <VerticalSpacing factor={2} />

            <Navigation destination={destination}/>

            <VerticalSpacing factor={2} />

            <ReactRouterAwaiter value={destinationImages}>
                {destinationImages =>
                    <DestinationGalleryContextProvider
                        destination={destination}
                        images={destinationImages.images}
                        galleries={destinationImages.galleries}
                    >
                        <DestinationGallery
                            destinationImages={destinationImages}
                            destination={destination}
                            onGalleryIsReady={onGalleryIsReady}
                        />
                        <DestinationAdminTools destination={destination} />
                    </DestinationGalleryContextProvider>
                }
            </ReactRouterAwaiter>

            <VerticalSpacing factor={2} />

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
};

const Destination = () => {
    const { destinationHeader } = useLoaderData();
    return (
        <ReactRouterAwaiter value={destinationHeader} >
            {destinationHeader => <DestinationDisplay destination={destinationHeader} />}
        </ReactRouterAwaiter>
    )
};

export default Destination;

export const Component = Destination;
