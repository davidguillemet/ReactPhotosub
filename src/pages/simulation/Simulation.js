import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {isMobile} from 'react-device-detect';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { FormLabel } from '@mui/material';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';

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
import FileUploads from './upload/FileUploads';

import {setBackground, resize, borderWidth, borderColor, shadow, addImage, setImage} from './actions/SimulationActions';

import { useResizeObserver } from '../../components/hooks';
import Search, { getInitialSearchResult } from '../../components/search';
import useImageLoader, {LIST_HOME_SLIDESHOW, LIST_FAVORITES, LIST_SEARCH, LIST_INTERIORS} from './hooks/imageLoaderHook';
import { withLoading, buildLoadingState } from '../../components/hoc';
import { useFirebaseContext } from '../../components/firebase';
import ErrorAlert from '../../components/error/error';
import { QUERY_ERROR } from '../../components/reactQuery';

const borderColors = [
    "#FFFFFF",
    "#000000",
    "#999999",
    "#8B4513",
];

const EmptySimulationImages = ({type, images, searchResult}) => {
    if (images === null) {
        // to avoid blinking component display when transitioning
        return null;
    }

    if (images === QUERY_ERROR ||
        (images.length === 0 && type === LIST_INTERIORS) ||
        (type === LIST_SEARCH && searchResult.hasError === true)) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                px: 1
            }}>
                <ErrorAlert />
            </Box>
        );
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
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                px: 1
            }}>
                <Alert severity={severity} elevation={4} variant="filled">{message}</Alert>
            </Box>
        );
    }

    return null;
}

const Simulation = ({simulations, simulationIndex, user, dispatch}) => {

    const firebaseContext = useFirebaseContext();
    const [listType, setListType] = useState(LIST_HOME_SLIDESHOW);
    const [interiors, images, setSearchImages, addUploadedInterior, deleteUploadedInterior] = useImageLoader(user, simulations, listType);
    const [currentInteriorIndex, setCurrentInteriorIndex] = useState(-1);
    const [searchResult, setSearchResult] = useState(getInitialSearchResult());
    const [userUploadRef, setUserUploadRef] = useState(null);

    const [currentImageId, setCurrentImageId] = useState(null);

    const simulation = useMemo(() => simulations[simulationIndex], [simulations, simulationIndex]);

    const resizeObserver = useResizeObserver();

    useEffect(() => {
        if (user !== null && user !== undefined) {
            const userUploadRef = firebaseContext.storageRef(`userUpload/${user.uid}/interiors`);
            setUserUploadRef(userUploadRef);
        }
    }, [user, firebaseContext])

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
            if (interiorIndex === -1 && interiors.length > 0) {
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

    const handleShadowChange = useCallback((event, newValue) => {
        dispatch(shadow(newValue, simulationIndex));
    }, [dispatch, simulationIndex])

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

        const image = images[index];
        if (currentImageId === null) {
            dispatch(addImage(image.src, image.sizeRatio, resizeObserver.width, simulationIndex));
        } else {
            // Update image :
            // - How to know the index ??
            // - How to update the image in the reducer ??
            dispatch(setImage(image.src, currentImageId, simulationIndex));
        }

    }, [images, currentImageId, dispatch, simulationIndex, resizeObserver.width]);

    const onFilesUploaded = useCallback((uploadedFiles) => {
        const files = [];
        const sizes = [];
        // uploadedFiles maps a file name to a file size ratio
        for (const [fileName, sizeRatio] of uploadedFiles) {
            // the download url looks like the following, including a download token:
            // https://firebasestorage.googleapis.com/v0/b/photosub.appspot.com/o/userUpload%2FO30yfAqRCnS99zc1VoKMjIt9IEg1%2Finteriors%2FDSC_1388-Modifier.jpg?alt=media&token=796f88e2-d1b2-4827-b0f5-da9008e778bb
            // While we just need the following:
            // https://storage.googleapis.com/photosub.appspot.com/userUpload%2FO30yfAqRCnS99zc1VoKMjIt9IEg1%2Finteriors%2FDSC_1388-Modifier.jpg
            files.push(`${firebaseContext.rootPublicUrl}/userUpload/${user.uid}/interiors/${fileName}`);
            sizes.push(sizeRatio);
        }
        // Add the new uploaded images to the interiors' array
        addUploadedInterior(files, sizes);
    }, [firebaseContext, user, addUploadedInterior]);

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
                userUploadRef &&
                <FileUploads
                    caption="Ajoutez des ambiances"
                    uploadRef={userUploadRef}
                    onFilesUploaded={onFilesUploaded}
                />
            }
            <VerticalSpacing factor={2} />
            <ImageSlider
                images={interiors}
                currentIndex={currentInteriorIndex}
                onThumbnailClick={onInteriorClick}
                style={{
                    mx: {
                        "xs": -1,
                        "sm": 0
                    }
                }}
                imageHeight={isMobile ? 100 : 120}
                disabled={simulation.isLocked}
                onDeleteUploaded={deleteUploadedInterior}
                emptyComponent={<EmptySimulationImages type={LIST_INTERIORS} images={interiors} />}
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
                <React.Fragment>
                    <VerticalSpacing factor={2} />
                    <Search
                        showExactSwitch={false}
                        onResult={handleSearchResult}
                        pageIndex={searchResult.page}
                    />
                </React.Fragment>
            }

            <VerticalSpacing factor={2} />
            <ImageSlider
                images={images}
                resetScrollOnChangeImages={listType !== LIST_SEARCH}
                currentIndex={-1}
                onThumbnailClick={onSelectImage}
                style={{
                    mx: {
                        "xs": -1,
                        "sm": 0
                    }
                }}
                imageHeight={isMobile ? 100 : 120}
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
                    borderColor: theme => theme.palette.divider,
                    borderRadius: "5px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 1,
                    px: 2
                }}
            >
                <FormLabel 
                    component="legend"
                    sx={{
                        padding: "5px",
                        color: theme => theme.palette.text.primary
                    }}
                >
                    <Typography variant="h4" style={{fontWeight: "100"}}>3. Configurez le Cadre</Typography>
                </FormLabel>

                <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: "center",
                    width: "100%"}}>
                    <Typography variant="h5" sx={{fontWeight: "100", width: 100, textAlign: "left"}}>Epaisseur:</Typography>
                    <HorizontalSpacing factor={isMobile ? 2 : 6} />
                    <BorderInput
                        value={simulation.border.width}
                        onChange={handleBorderWidthChange}
                        width={140}
                        disabled={simulation.isLocked}
                    />
                </Box>

                <VerticalSpacing factor={3} />

                <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: "center",
                    width: "100%"}}
                >
                    <Typography variant="h5" sx={{fontWeight: "100", width: 100, textAlign: "left"}}>Couleur:</Typography>
                    <HorizontalSpacing factor={isMobile ? 2 : 6} />
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
                            sx={{ width: 140}}
                        >
                            {
                                borderColors.map((color, index) => {
                                    return (
                                        <MenuItem
                                            key={index}
                                            value={color}>
                                            <Box
                                                sx={{
                                                    width: "20px",
                                                    height: "20px",
                                                    backgroundColor: color,
                                                    borderWidth: '1px',
                                                    borderStyle: "solid",
                                                    borderColor: theme => theme.palette.divider,
                                                    borderRadius: "3px"
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

                <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: "center",
                    width: "100%"}}
                >
                    <Typography variant="h5" sx={{fontWeight: "100", width: 100, textAlign: "left"}}>Ombre:</Typography>
                    <HorizontalSpacing factor={isMobile ? 2 : 6} />
                    <Slider
                        value={simulation.shadow}
                        onChange={handleShadowChange}
                        step={1}
                        min={0}
                        max={24}
                        sx={{
                            width: 120
                        }}
                    />
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
                width={resizeObserver.width}
            />

        </Box>
    );
};

export default withLoading(Simulation, [buildLoadingState("simulationIndex", -1)]);