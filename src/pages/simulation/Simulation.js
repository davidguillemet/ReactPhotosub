import React, { useEffect, useState, useRef, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import LockIcon from '@material-ui/icons/Lock';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import BorderInput from './BorderInput';
import PageTitle from '../../template/pageTitle';
import { VerticalSpacing, HorizontalSpacing } from '../../template/spacing';
import ImageSlider from '../../components/imageSlider';
import dataProvider from '../../dataProvider';

import 'fontsource-roboto/100.css';

const placeHolder = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=`;

const defaultBorderWidth = 2;

const borderColors = [
    "#FFFFFF",
    "#000000",
    "#999999",
    "#8B4513",
];

const defaultBorderColor = borderColors[0];

const localStorageKey = "photosub_simulation";

const useStyle = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        border: `1px solid ${theme.palette.divider}`,
        flexWrap: 'wrap',
    }
}));

const Simulation = () => {

    const classes = useStyle();

    const [frameIsReady, setFrameIsReady] = useState(false);

    const [interiors, setInteriors] = useState([]);
    const [images, setImages] = useState([]);
    const [currentInteriorIndex, setCurrentInteriorIndex] = useState(-1);

    const [insertNewImage, setInsertNewImage] = useState(false);
    const [borderWidth, setBorderWidth] = useState(defaultBorderWidth);
    const [borderColor, setBorderColor] = useState(defaultBorderColor);
    const [imageCount, setImageCount] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    const iFrameRef = useRef(null);

    const sendMessage = useCallback((msg) => {
        iFrameRef.current.contentWindow.postMessage(msg, "*");
    }, []);

    const loadSimulation = useCallback((simulationData) => {
        sendMessage({
            action: 'import',
            data: simulationData,
            clearBefore: false,
            source: 'save'
        });
        const interiorIndex = interiors.findIndex(interior => interior.src === simulationData.background);
        if (interiorIndex !== -1) {
            setCurrentInteriorIndex(interiorIndex);
        } else {
            // TODO: how to manage a missing interior...
        }
    }, [sendMessage, interiors]);

    const iFrameRefCallback = useCallback((node) => {
        if (node !== null) {
            iFrameRef.current = node;
        }
    }, []);

    const handleBorderWidthChange = useCallback((newBorderWidth) => {
        setBorderWidth(newBorderWidth);
        sendMessage({
            action: 'border',
            property: 'border-width',
            value: newBorderWidth
        });
    }, [sendMessage]);

    const handleBorderColorChange = useCallback((event) => {
        const newBorderColor = event.target.value;
        setBorderColor(newBorderColor);
        sendMessage({
            action: 'border',
            property: 'border-color',
            value: newBorderColor
        });
    }, [sendMessage]);

    useEffect(() => {
        if (frameIsReady) {
            sendMessage({
                action: 'device',
                device: 'desktop' // TODO 'mobile'
            });
        }
    }, [frameIsReady, sendMessage]);

    useEffect(() => {
        const messageHandler = (messageEvent) => {
            const message = messageEvent.data;
            switch (message.action) {
                case "ready":
                {
                    setFrameIsReady(true);
                    break;
                }
                case "update":
                {
                    setImageCount(message.count);
                    if (message.count === 0) {
                        setInsertNewImage(false);
                    }
                    break;
                }
                case "export":
                {
                    // Add the background url
                    message.data["background"] = interiors[currentInteriorIndex].src;
        
                    if (message.target === 'save') {
                        // Save in local storage
                        localStorage.setItem(localStorageKey, JSON.stringify(message.data));
                    } else {
                        /* Keep export feature ??
                        wixWindow.openLightbox("SimulationExport", message.data).then(fileUrl => {
                            wixLocation.to(fileUrl);
                        });
                        */
                    }
                    break;
                }
                case "border":
                {
                    if (message.property === 'border-width')
                    {
                        setBorderWidth(message.value);
                    } else if (message.property === 'border-color') {
                        setBorderColor(message.value);
                    }
                    break;
                }
                case 'lock':
                {
                    setIsLocked(message.isLocked);
                    break;
                }
                default:
                    console.error("Unknown message :");
                    console.log(message);
            }
        }
        window.addEventListener("message", messageHandler)

        // clean up
        return () => window.removeEventListener("message", messageHandler)
    }, [interiors, currentInteriorIndex]); // Add dependency ???

    // Load interiors
    useEffect(() => {
        dataProvider.getInteriors().then(interiors => {
            setInteriors(interiors.map((interior, index) => {
                return {
                    src: interior,
                    id: index
                }
            }));
            setCurrentInteriorIndex(0);
        })
    }, []);

    // Load image selection = home slideshow ?
    useEffect(() => {
        dataProvider.getInteriors().then(interiors => {
            setImages(interiors.map((interior, index) => {
                return {
                    src: interior,
                    id: index
                }
            }));
        })
    }, []);

    // Load possible simulation from local storage
    useEffect(() => {
        if (frameIsReady ===  false || interiors.length === 0) {
            return;
        }
        const storedProject = localStorage.getItem(localStorageKey);
        if (storedProject !== null && storedProject !== undefined && storedProject.length > 0) {
            loadSimulation(JSON.parse(storedProject));
        }
    }, [frameIsReady, interiors, loadSimulation])
    
    function handleChangeInsertNewImage(event) {
        setInsertNewImage(event.target.checked);
    }

    function selectImage(index) {
        sendMessage({
            action: insertNewImage === true ? "add" : "set",
            image: images[index].src
        });
    }

    const baseUrl = window.location.origin;

    return (
        <React.Fragment>
            <PageTitle>Simulation</PageTitle>
            <VerticalSpacing factor={3} />
            <Typography variant="h4" style={{fontWeight: "100"}}>1. Sélectionnez une ambiance d'intérieur</Typography>
            <ImageSlider
                images={interiors}
                currentIndex={currentInteriorIndex}
                onThumbnailClick={setCurrentInteriorIndex}
                style={{
                    maxWidth: 1200,
                    width: '100%'
                }}
                imageHeight={120}
                imageBorderWidth={3}
                imageBorderRadius={5}
            />
            <VerticalSpacing factor={3} />
            <Typography variant="h4" style={{fontWeight: "100"}}>2. Sélectionnez une image</Typography>
            <ImageSlider
                images={images}
                currentIndex={-1}
                onThumbnailClick={selectImage}
                style={{
                    maxWidth: 1200,
                    width: '100%'
                }}
                imageHeight={120}
                imageBorderWidth={3}
                imageBorderRadius={5}
            />
            <VerticalSpacing factor={1} />
            <FormControlLabel
                control={
                    <Switch
                        checked={insertNewImage}
                        onChange={handleChangeInsertNewImage}
                        name="insertNewImage"
                        color="primary"
                        disabled={imageCount === 0}
                />}
                label="Insérer une nouvelle image"
            />

            <VerticalSpacing factor={2} />

            <Box style={{
                display: 'flex',
                alignItems: 'center'}}>
                <Typography variant="h5" style={{fontWeight: "100"}}>Epaisseur du cadre</Typography>
                <HorizontalSpacing factor={2} />
                <BorderInput
                    value={borderWidth}
                    onChange={handleBorderWidthChange}
                    width={200}
                    disabled={isLocked}
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
                        value={borderColor}
                        onChange={handleBorderColorChange}
                        disabled={isLocked}
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

            <Box style={{
                width: '100%',
                maxWidth: 1200,
                position: 'relative'
            }}>
                <img
                    alt=""
                    border="0"
                    src={currentInteriorIndex >= 0 ? interiors[currentInteriorIndex].src : placeHolder}
                    style={{
                        width: '100%'
                    }}
                />
                <iframe
                    ref={iFrameRefCallback}
                    title="Simulation Frame"
                    frameBorder="0"
                    scrolling="no"
                    src={`${baseUrl}/dragdrop_indicator_container.html`}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}>
                </iframe>
                { 
                    isLocked && <LockIcon fontSize='large' style={{
                        position: "absolute",
                        top: 10,
                        left: 10
                    }}/>
                }
            </Box>
        </React.Fragment>
    );
};

export default Simulation;