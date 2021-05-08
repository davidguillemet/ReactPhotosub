import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {unstable_batchedUpdates} from 'react-dom';

import BorderInput from './BorderInput';
import { VerticalSpacing, HorizontalSpacing } from '../../template/spacing';
import ImageSlider from '../../components/imageSlider';
import dataProvider from '../../dataProvider';
import SimulationDisplay from './SimulationDisplay';
import FileUpload from './FileUpload';

import {setBackground, resize, borderWidth, borderColor, addImage, setImage} from './actions/SimulationActions';

import { useResizeObserver } from '../../components/hooks';
import useImageLoader from './imageLoaderHook';

const borderColors = [
    "#FFFFFF",
    "#000000",
    "#999999",
    "#8B4513",
];

const useStyle = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        border: `1px solid ${theme.palette.divider}`,
        flexWrap: 'wrap',
    }
}));

const Simulation = ({simulations, simulationIndex, user, dispatch}) => {

    const classes = useStyle();

    const [ interiors, images, addUploadedInterior, deleteUploadedInterior] = useImageLoader(user, simulations);
    const [currentInteriorIndex, setCurrentInteriorIndex] = useState(-1);

    const [currentImageId, setCurrentImageId] = useState(null);

    const simulation = useMemo(() => simulations[simulationIndex], [simulations, simulationIndex]);

    const handleResize = useCallback(({width, height}) => {
        dispatch(resize(width, simulationIndex));
    }, [simulationIndex, dispatch]);

    const resizeObserver = useResizeObserver(handleResize);

    useEffect(() => {
        if (interiors === null) {
            return;
        }
        let interiorIndex = 0;
        let initBackground = true;
        if (simulation.background !== null) {
            interiorIndex = interiors.findIndex(interior => interior.src === simulation.background);
            if (interiorIndex === -1) {
                // Background not found
                interiorIndex = 0;
            } else {
                initBackground = false;
            }
        }

        unstable_batchedUpdates(() => {
            setCurrentInteriorIndex(interiorIndex);
            if (initBackground) {
                dispatch(setBackground(interiors[interiorIndex].src, simulationIndex));
            }
        });
    }, [simulation, simulationIndex, interiors, dispatch])

    const handleBorderWidthChange = useCallback((newBorderWidth) => {
        dispatch(borderWidth(newBorderWidth, simulationIndex));
    }, [dispatch, simulationIndex]);

    const handleBorderColorChange = useCallback((event) => {
        const newBorderColor = event.target.value;
        dispatch(borderColor(newBorderColor, simulationIndex));
    }, [dispatch, simulationIndex]);

    const handleSetCurrentImageId = useCallback((id) => {
        setCurrentImageId(prevCurrentId => {
            return prevCurrentId === id ? null : id;
        });
    }, [])

    const onInteriorClick = useCallback((interiorIndex) => {
        unstable_batchedUpdates(() => {
            setCurrentInteriorIndex(interiorIndex);
            dispatch(setBackground(interiors[interiorIndex].src, simulationIndex));
        });
    }, [interiors, dispatch, simulationIndex]);

    const onSelectImage = useCallback((index) => {

        const imageSrc = images[index].src;
        if (currentImageId === null) {
            dispatch(addImage(imageSrc, resizeObserver.width, simulationIndex));
        } else {
            // Update image :
            // - How to know the index ??
            // - How to update the image in the reducer ??
            dispatch(setImage(imageSrc, currentImageId, simulationIndex));
        }

    }, [images, currentImageId, dispatch, simulationIndex, resizeObserver.width]);

    const onFileUploaded = useCallback((fileName, downloadUrl) => {
        // the download url looks like the following, including a doanlowd token:
        // https://firebasestorage.googleapis.com/v0/b/photosub.appspot.com/o/userUpload%2FO30yfAqRCnS99zc1VoKMjIt9IEg1%2Finteriors%2FDSC_1388-Modifier.jpg?alt=media&token=796f88e2-d1b2-4827-b0f5-da9008e778bb
        // While we just need the following:
        // https://storage.googleapis.com/photosub.appspot.com/userUpload%2FO30yfAqRCnS99zc1VoKMjIt9IEg1%2Finteriors%2FDSC_1388-Modifier.jpg
        const fileSrc = `https://storage.googleapis.com/photosub.appspot.com/userUpload/${user.uid}/interiors/${fileName}`;
        // Add the new uploaded image to the interiors' array
        addUploadedInterior(fileSrc);
    }, [user, addUploadedInterior]);

    const onDeleteUploaded = useCallback((fileUrl) => {
        // Extract the file name from the src
        const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        dataProvider.removeUploadedInterior(fileName).then(() => {
            deleteUploadedInterior(fileUrl);
        }).catch(err => {
            // TODO
        });
    }, [deleteUploadedInterior]);

    return (
        <React.Fragment>

            <Typography variant="h4" style={{fontWeight: "100"}}>1. Sélectionnez une ambiance</Typography>
            <ImageSlider
                images={interiors}
                currentIndex={currentInteriorIndex}
                onThumbnailClick={onInteriorClick}
                style={{
                    maxWidth: 1200,
                    width: '100%'
                }}
                imageHeight={120}
                imageBorderWidth={3}
                imageBorderRadius={5}
                disabled={simulation.isLocked}
                onDeleteUploaded={onDeleteUploaded}
            />

            {
                user &&
                <FileUpload
                    caption="Chargez vos propres images"
                    user={user}
                    onFileUploaded={onFileUploaded}
                />
            }

            <VerticalSpacing factor={3} />

            <Typography variant="h4" style={{fontWeight: "100"}}>2. Insérez des images</Typography>
            <ImageSlider
                images={images}
                currentIndex={-1}
                onThumbnailClick={onSelectImage}
                style={{
                    maxWidth: 1200,
                    width: '100%'
                }}
                imageHeight={120}
                imageBorderWidth={3}
                imageBorderRadius={5}
                disabled={simulation.isLocked}
            />

            <VerticalSpacing factor={3} />

            <Box style={{
                display: 'flex',
                alignItems: 'center'}}>
                <Typography variant="h5" style={{fontWeight: "100"}}>Epaisseur du cadre</Typography>
                <HorizontalSpacing factor={2} />
                <BorderInput
                    value={simulation.border.width}
                    onChange={handleBorderWidthChange}
                    width={200}
                    disabled={simulation.isLocked}
                />
            </Box>

            <VerticalSpacing factor={3} />

            <Box style={{
                display: 'flex',
                alignItems: 'center'}}>
                <Typography variant="h5" style={{fontWeight: "100"}}>Couleur du cadre</Typography>
                <HorizontalSpacing factor={2} />
                <FormControl variant="outlined" className={classes.formControl}>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={simulation.border.color}
                        onChange={handleBorderColorChange}
                        disabled={simulation.isLocked}
                    >
                        {
                            borderColors.map((color, index) => {
                                return (
                                    <MenuItem
                                        key={index}
                                        value={color}>
                                        <Box
                                            style={{
                                                width: 20,
                                                height: 20,
                                                backgroundColor: color,
                                                border: '1px solid black',
                                                borderRadius: 3
                                            }}
                                        />
                                    </MenuItem>
                                );
                            })
                        }
                    </Select>
                </FormControl>
            </Box>

            <VerticalSpacing factor={3} />

            {
                /* Wait for the background being initialized for new simulation */
                <SimulationDisplay
                    ref={resizeObserver.ref}
                    simulations={simulations}
                    simulationIndex={simulationIndex}
                    dispatch={dispatch}
                    onImageClick={handleSetCurrentImageId}
                    seletedImage={currentImageId}/>
            }

        </React.Fragment>
    );
};

export default Simulation;