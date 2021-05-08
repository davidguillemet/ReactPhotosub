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

import { uniqueID } from '../../utils/utils';

import {setBackground, resize, borderWidth, borderColor, addImage, setImage} from './actions/SimulationActions';

import { useResizeObserver } from '../../components/hooks';

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

    const [interiors, setInteriors] = useState(null);
    const [userInteriors, setUserInteriors] = useState(null);
    const [allInteriors, setAllInteriors] = useState(null);
    const [images, setImages] = useState(null);
    const [currentInteriorIndex, setCurrentInteriorIndex] = useState(-1);

    const [currentImageId, setCurrentImageId] = useState(null);

    const simulation = useMemo(() => simulations[simulationIndex], [simulations, simulationIndex]);

    const handleResize = useCallback(({width, height}) => {
        dispatch(resize(width, simulationIndex));
    }, [simulationIndex, dispatch]);

    const resizeObserver = useResizeObserver(handleResize);

    const userInteriorIsUsed = useCallback((userInteriorUrl) => {
        // Check is any simulation contains the current background
        return simulations.findIndex((simulation) => simulation.background === userInteriorUrl) === -1;
    }, [simulations]);

    // Check the "deletable" property of the uploaded interiors
    useEffect(() => {
        if (simulations === null || userInteriors === null || interiors == null) {
            return;
        }
        let modified = false;
        for (let i = 0; i < userInteriors.length; i++) {
            const interior = userInteriors[i];
            const prevDeletable = interior.deletable;
            if (userInteriorIsUsed(interior.src)) {
                interior.deletable = false;
            } else {
                interior.deletable = true;
            }
            modified = modified || (prevDeletable !== interior.deletable);
        }
        if (modified === true) {
            setAllInteriors([ ...userInteriors, ...interiors ]);
        }
    }, [userInteriorIsUsed, simulations, userInteriors, interiors]);

    useEffect(() => {
        if (allInteriors === null) {
            return;
        }
        dispatch(setBackground(allInteriors[0].src, false /* Don't replace if not null */, simulationIndex));
        setCurrentInteriorIndex(allInteriors.findIndex(interior => interior.src === simulation.background));
    }, [simulation, simulationIndex, allInteriors, dispatch])

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
            dispatch(setBackground(allInteriors[interiorIndex].src, true /* Replace */, simulationIndex));
        });
    }, [allInteriors, dispatch, simulationIndex]);

    const buildImageFromUrl = useCallback((url, uploaded) => {
        return {
            src: url,
            id: uniqueID(),
            uploaded: uploaded,
            deletable: true
        }
    }, []);

    const onDeleteUploaded = useCallback((fileUrl) => {
        // Extract the file name from the src
        const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        dataProvider.removeUploadedInterior(fileName).then(() => {
            setUserInteriors(prevInteriors => {
                return prevInteriors.filter(interior => interior.src !== fileUrl);
            });
        }).catch(err => {
            // TODO
        });
    }, []);

    const buildImagesFromUrls = useCallback((urls, uploaded) => {
        return urls.map((url) => buildImageFromUrl(url, uploaded));
    }, [buildImageFromUrl]);

    // Update the collection containing all interiors
    useEffect(() => {
        if (interiors === null || userInteriors === null) {
            return;
        }
        unstable_batchedUpdates(() => {
            setAllInteriors([...userInteriors, ...interiors]);
            setCurrentInteriorIndex(0);
        });
    }, [interiors, userInteriors]);

    // Load interiors
    useEffect(() => {
        dataProvider.getInteriors().then(values => {
            unstable_batchedUpdates(() => {
                const defaultInteriors = buildImagesFromUrls(values, false);
                setInteriors(defaultInteriors);
            });
        })
    }, [buildImagesFromUrls]);

    // Load user uploaded interiors
    useEffect(() => {
        const loadPromise =
            user === null ?
            Promise.resolve([]) :
            dataProvider.getUploadedInteriors();
        
        loadPromise.then(values => {
            unstable_batchedUpdates(() => {
                const userInteriors = buildImagesFromUrls(values, true);
                setUserInteriors(userInteriors);
            });
        })
    }, [user, buildImagesFromUrls]);

    // Load image selection = home slideshow ?
    useEffect(() => {
        dataProvider.getInteriors().then(interiors => {
            setImages(interiors.map(interior => {
                return {
                    src: interior,
                    id: uniqueID()
                }
            }));
        })
    }, []);

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
        setUserInteriors(prevInteriors => [
            buildImageFromUrl(fileSrc, true),
            ...prevInteriors
        ]);
    }, [buildImageFromUrl, user]);

    return (
        <React.Fragment>

            <Typography variant="h4" style={{fontWeight: "100"}}>1. Sélectionnez une ambiance</Typography>
            <ImageSlider
                images={allInteriors}
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