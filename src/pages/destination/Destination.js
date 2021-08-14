import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import { formatDate } from '../../utils/utils';
import dataProvider from '../../dataProvider';
import { Gallery } from '../../components';
import PageTitle, { PageSubTitle } from '../../template/pageTitle';

import 'fontsource-roboto/400.css';
import 'fontsource-roboto/100.css';


const RegionChip = ({region}) => {

    return (
        <Chip label={region.title} sx={{m: 1}} />
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

    if (destination === null) {
        return <CircularProgress size={40} />
    }

    return (
        <React.Fragment>
            <PageTitle>{destination.title}</PageTitle>
            <PageSubTitle>{formatDate(new Date(destination.date))}</PageSubTitle>
            <RegionPath regions={destination.region_path}></RegionPath>
            <Gallery images={images} style={{width: '100%'}} colWidth={300} margin={5}/>
        </React.Fragment>
    );
};

export default Destination;