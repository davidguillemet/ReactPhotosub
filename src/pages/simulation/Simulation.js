import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import ImageSlider from '../../components/imageSlider';
import dataProvider from '../../dataProvider';

const Simulation = () => {

    const [images, setImages] = useState([]);
    const [currentInteriorIndex, setCurrentInteriorIndex] = useState(0);

    useEffect(() => {
        dataProvider.getInteriors().then(interiors => {
            setImages(interiors.map((interior, index) => {
                return {
                    src: interior,
                    id: index
                }
            }));
        })
    }, [])

    function setCurrentIndex(index) {
        setCurrentInteriorIndex(index);
        // TODO : display current interior
    }

    return (
        <React.Fragment>
            <Typography variant="h2">Simulation</Typography>
            <ImageSlider
                images={images}
                currentIndex={currentInteriorIndex}
                onThumbnailClick={setCurrentIndex}
                style={{
                    width: '100%'
                }}
            />
        </React.Fragment>
    );
};

export default Simulation;