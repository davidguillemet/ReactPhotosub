import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import dataProvider from '../../dataProvider';

const Simulation = () => {

    const [images, setImages] = useState([]);

    useEffect(() => {
        dataProvider.getInteriors().then(interiors => {
            setImages(interiors);
        })
    }, [])

    return (
        <React.Fragment>
            <Typography variant="h2">Simulation</Typography>
            {
                images.map((image, index) => {
                    return (
                        <img key={index} alt="" src={image}></img>
                    );
                })
            }
        </React.Fragment>
    );
};

export default Simulation;