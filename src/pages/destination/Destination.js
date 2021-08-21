import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import { formatDate } from '../../utils';
import dataProvider from '../../dataProvider';
import Gallery from '../../components/gallery';
import PageTitle, { PageSubTitle } from '../../template/pageTitle';
import SummaryDialog from './SummaryDialog';
import LocationDialog from './LocationDialog';

import 'fontsource-roboto/400.css';
import 'fontsource-roboto/100.css';


const RegionChip = ({region}) => {

    return (
        <Chip label={region.title} sx={{mx: 0.5, my: 1}} variant='outlined' />
    )
}

const RegionPath = ({regions}) => {

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
            }}
        >
        { regions.slice(0).reverse().map(region => <RegionChip key={region.id} region={region} />) }
        </Box>
    );
} 

const Destination = () => {
    const { year, title } = useParams();
    const [destination, setDestination] = useState(null);
    const [images, setImages] = useState([]);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [locationOpen, setLocationOpen] = useState(false);

    // First hook to get the destination details
    useEffect(() => {
        dataProvider.getDestinationDetailsFromPath(year, title).then(destination => {
            setDestination(destination);
        })
    }, [year, title]);

    // Second hook to get destination images
    useEffect(() => {
        dataProvider.getDestinationImagesFromPath(year, title).then(images => {
            setImages(images);
        })
    }, [year, title]);

    const handleCloseSummary = useCallback(() => {
        setSummaryOpen(false);
    }, []);

    const handleCloseLocation = useCallback(() => {
        setLocationOpen(false);
    }, []);

    if (destination === null) {
        return <CircularProgress size={40} />
    }

    const handleOpenSummary = () => {
        setSummaryOpen(true);
    }

    const handleLocationSummary = () => {
        setLocationOpen(true);
    }

    return (
        <React.Fragment>
            <PageTitle>{destination.title}</PageTitle>
            <PageSubTitle>{formatDate(new Date(destination.date))}</PageSubTitle>
            <RegionPath regions={destination.region_path}></RegionPath>
            <Chip
                icon={<PhotoLibraryIcon />}
                label={`${images.length} images`}
                sx={{
                    px: 1
                }}>
            </Chip>

            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
            }}>
                <Button sx={{m: 1}} onClick={handleOpenSummary} variant="outlined">Voir le Résumé</Button>
                <Button sx={{m: 1}} onClick={handleLocationSummary} variant="outlined">Voir le lieu</Button>
            </Box>
            <SummaryDialog
                destination={destination}
                open={summaryOpen}
                handleClose={handleCloseSummary}
            />
            <LocationDialog
                destination={destination}
                open={locationOpen}
                handleClose={handleCloseLocation}
            />

            <Gallery images={images} style={{width: '100%'}} colWidth={300} margin={5}/>

        </React.Fragment>
    );
};

export default Destination;