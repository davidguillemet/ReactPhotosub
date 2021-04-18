import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { formatDate } from '../../utils/utils';
import dataProvider from '../../dataProvider';
import { Gallery } from '../../components';
import PageTitle from '../../template/pageTitle';

import 'fontsource-roboto/400.css';
import 'fontsource-roboto/100.css';

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
            <Typography variant="h4" style={{fontWeight: "100"}}>{formatDate(new Date(destination.date))}</Typography>
            <Gallery images={images} style={{width: '100%'}} colWidth={300} margin={5}/>
        </React.Fragment>
    );
};

export default Destination;