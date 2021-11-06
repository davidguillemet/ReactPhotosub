import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {isMobile} from 'react-device-detect';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { FormLabel } from '@mui/material';
import Select from '@mui/material/Select';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CollectionsIcon from '@mui/icons-material/Collections';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';

import Alert from '@mui/material/Alert';

import {unstable_batchedUpdates} from 'react-dom';

import BorderInput from './BorderInput';
import { VerticalSpacing, HorizontalSpacing } from '../../template/spacing';
import ImageSlider from '../../components/imageSlider';
import SimulationDisplay from './SimulationDisplay';
import FileUpload from './FileUpload';

import {setBackground, resize, borderWidth, borderColor, addImage, setImage} from './actions/SimulationActions';

import { useResizeObserver } from '../../components/hooks';
import Search, { getInitialSearchResult } from '../../components/search';
import useImageLoader, {LIST_HOME_SLIDESHOW, LIST_FAVORITES, LIST_SEARCH} from './hooks/imageLoaderHook';

const borderColors = [
    "#FFFFFF",
    "#000000",
    "#999999",
    "#8B4513",
];

const EmptySimulationImages = ({type, images, searchResult}) => {
    if (images === null) {
        // to avoid blinking component display when transitionning
        return null;
    }

    if (type === LIST_FAVORITES || type === LIST_SEARCH) {
        const message = 
            type === LIST_FAVORITES ?
            "Votre liste de favoris est vide." :
            searchResult.totalCount >= 0 ?
            "Votre recherche n'a retourné aucun résultat." :
            "Saisissez un critère pour lancer une recherche.";

            const severity =
            type === LIST_FAVORITES || searchResult.totalCount < 0 ?
            "info" : "warning";

        return (
            <Box style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Alert severity={severity} elevation={4} variant="filled">{message}</Alert>
            </Box>
        );
    }

    return null;
}

const Simulation = ({simulations, simulationIndex, user, dispatch}) => {

    const [listType, setListType] = useState(LIST_HOME_SLIDESHOW);
    const [interiors, images, setSearchImages, addUploadedInterior, deleteUploadedInterior] = useImageLoader(user, simulations, listType);
    const [currentInteriorIndex, setCurrentInteriorIndex] = useState(-1);
    const [searchResult, setSearchResult] = useState(getInitialSearchResult());

    const [currentImageId, setCurrentImageId] = useState(null);

    const simulation = useMemo(() => simulations[simulationIndex], [simulations, simulationIndex]);

    const resizeObserver = useResizeObserver();

    useEffect(() => {
        if (resizeObserver.width > 0) {
            dispatch(resize(resizeObserver.width, simulationIndex));
        }
    }, [resizeObserver.width, simulationIndex, dispatch]);

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

    const handleToggleCurrentImageId = useCallback((id) => {
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

    const onFileUploaded = useCallback((fileName, sizeRatio) => {
        // the download url looks like the following, including a download token:
        // https://firebasestorage.googleapis.com/v0/b/photosub.appspot.com/o/userUpload%2FO30yfAqRCnS99zc1VoKMjIt9IEg1%2Finteriors%2FDSC_1388-Modifier.jpg?alt=media&token=796f88e2-d1b2-4827-b0f5-da9008e778bb
        // While we just need the following:
        // https://storage.googleapis.com/photosub.appspot.com/userUpload%2FO30yfAqRCnS99zc1VoKMjIt9IEg1%2Finteriors%2FDSC_1388-Modifier.jpg
        const fileSrc = `https://storage.googleapis.com/photosub.appspot.com/userUpload/${user.uid}/interiors/${fileName}`;
        // Add the new uploaded image to the interiors' array
        addUploadedInterior(fileSrc, sizeRatio);
    }, [user, addUploadedInterior]);

    const handleListType = (event, newListType) => {
        if (newListType === null) {
            return;
        }
        unstable_batchedUpdates(() => {
            if (newListType !== LIST_SEARCH)
            {
                setSearchResult(getInitialSearchResult());
            }
            setListType(newListType);
        });
    }

    const handleSearchResult = useCallback((searchResults) => {
        unstable_batchedUpdates(() => {
            setSearchImages(searchResults.images)
            setSearchResult(searchResults);
        });
    }, [setSearchImages]);

    const handleNextSearchPage = useCallback(() => {
        setSearchResult(prevSearchResult => {
            return {
                ...prevSearchResult,
                page: prevSearchResult.page + 1
            }
        });
    }, []);

    return (
        <Box sx={{ maxWidth: 1200, width: '100%'}}>

            <Typography variant="h4" style={{fontWeight: "100"}}>1. Sélectionnez une ambiance</Typography>
            {
                user &&
                <FileUpload
                    caption="Ajoutez des ambiances"
                    user={user}
                    onFileUploaded={onFileUploaded}
                />
            }
            <VerticalSpacing factor={2} />
            <ImageSlider
                images={interiors}
                currentIndex={currentInteriorIndex}
                onThumbnailClick={onInteriorClick}
                style={{
                    borderWidth: 0,
                    mx: {
                        "xs": -1,
                        "sm": 0
                    } 
                }}
                elevation={0}
                imageHeight={isMobile ? 100 : 120}
                imageBorderWidth={3}
                imageBorderRadius={5}
                disabled={simulation.isLocked}
                onDeleteUploaded={deleteUploadedInterior}
            />

            <VerticalSpacing factor={3} />

            <Typography variant="h4" style={{fontWeight: "100"}}>2. Insérez des images</Typography>
            <VerticalSpacing factor={1} />
            <ToggleButtonGroup exclusive value={listType} onChange={handleListType} >
                <ToggleButton value={LIST_HOME_SLIDESHOW} >
                    <Tooltip title="Présélection">
                        <CollectionsIcon />
                    </Tooltip>
                </ToggleButton>
                {
                    user &&
                    <ToggleButton value={LIST_FAVORITES} >
                        <Tooltip title="Favoris">
                            <FavoriteIcon />
                        </Tooltip>
                    </ToggleButton>
                }
                <ToggleButton value={LIST_SEARCH} >
                    <Tooltip title="Recherche">
                        <SearchIcon />
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>

            {
                listType === LIST_SEARCH &&
                <Search
                    showExactSwitch={false}
                    onResult={handleSearchResult}
                    pageIndex={searchResult.page}
                />
            }

            <VerticalSpacing factor={2} />
            <ImageSlider
                images={images}
                currentIndex={-1}
                onThumbnailClick={onSelectImage}
                style={{
                    mx: {
                        "xs": -1,
                        "sm": 0
                    } 
                }}
                elevation={0}
                imageHeight={isMobile ? 100 : 120}
                imageBorderWidth={3}
                imageBorderRadius={5}
                disabled={simulation.isLocked}
                emptyComponent={<EmptySimulationImages type={listType} images={images} searchResult={searchResult} />}
                onNextPage={handleNextSearchPage}
                hasNext={searchResult.hasNext}
            />

            <VerticalSpacing factor={3} />
            
            <FormControl 
                component="fieldset" 
                variant="outlined"
                sx={{
                    width: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: theme => theme.palette.text.disabled,
                    borderRadius: "5px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 2
                }}
            >
                <FormLabel 
                    component="legend"
                    sx={{
                        padding: "5px",
                        color: theme => theme.palette.text.secondary
                    }}
                >
                    <Typography variant="h4" style={{fontWeight: "100"}}>3. Configurez le Cadre</Typography>
                </FormLabel>

                <Box style={{
                    display: 'flex',
                    alignItems: 'center'}}>
                    <Typography variant="h5" style={{fontWeight: "100"}}>Epaisseur</Typography>
                    <HorizontalSpacing factor={2} />
                    <BorderInput
                        value={simulation.border.width}
                        onChange={handleBorderWidthChange}
                        width={160}
                        disabled={simulation.isLocked}
                    />
                </Box>

                <VerticalSpacing factor={3} />

                <Box style={{
                    display: 'flex',
                    alignItems: 'center'}}>
                    <Typography variant="h5" style={{fontWeight: "100"}}>Couleur</Typography>
                    <HorizontalSpacing factor={2} />
                    <FormControl
                        variant="outlined"
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap'               
                        }}
                    >
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
            
            </FormControl>
            
            <VerticalSpacing factor={3} />

            <SimulationDisplay
                ref={resizeObserver.ref}
                simulations={simulations}
                simulationIndex={simulationIndex}
                dispatch={dispatch}
                onToggleCurrentImageId={handleToggleCurrentImageId}
                selectedImage={currentImageId}
            />

        </Box>
    );
};

export default Simulation;