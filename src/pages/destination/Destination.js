import React, { useState, useCallback } from 'react';
import { useParams } from "react-router-dom";
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import { formatDate } from '../../utils';
import Gallery from '../../components/gallery';
import { PageTitle, PageSubTitle } from '../../template/pageTypography';
import LocationDialog from './LocationDialog';
import LazyDialog from '../../dialogs/LazyDialog';
import { withLoading, buildLoadingState } from '../../components/loading';
import { useGlobalContext } from '../../components/globalContext';

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

const DestinationDisplay = withLoading(({destination, year, title}) => {

    const context = useGlobalContext();
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [locationOpen, setLocationOpen] = useState(false);
    const { data: images } = context.useFetchDestinationImages(year, title);

    const handleCloseLocation = useCallback(() => {
        setLocationOpen(false);
    }, []);

    const handleOpenLocation = () => {
        setLocationOpen(true);
    }

    const toggleOpenSummary = useCallback(() => {
        setSummaryOpen(open => !open);
    }, []);


    return (
        <React.Fragment>
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

            <Gallery images={images} style={{width: '100%'}} colWidth={300} margin={5}/>

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