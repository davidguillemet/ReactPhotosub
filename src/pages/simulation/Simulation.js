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

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import {unstable_batchedUpdates} from 'react-dom'

import BorderInput from './BorderInput';
import PageTitle from '../../template/pageTitle';
import { VerticalSpacing, HorizontalSpacing } from '../../template/spacing';
import ImageSlider from '../../components/imageSlider';
import dataProvider from '../../dataProvider';
import SimulationToolBar from './SimulationToolBar';

import { AuthContext } from '../../components/authentication';
import { uniqueID } from '../../utils/utils';

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

function getLocalSimulation() {
    const localSimulationString = localStorage.getItem(localStorageKey);
    if (localSimulationString === null) {
        return null;
    }
    return JSON.parse(localSimulationString);
}

function saveLocalSimulation(simulationData, isDirty, name) {
    if (name !== null && name !== undefined) {
        simulationData.name = name;
    }
    simulationData.isDirty = isDirty;
    localStorage.setItem(localStorageKey, JSON.stringify(simulationData));
}

const useStyle = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        border: `1px solid ${theme.palette.divider}`,
        flexWrap: 'wrap',
    }
}));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const FeedbackMessage = ({severity, message}) => {

    const [feedback, setFeedback] = useState({
        severity: "success",
        message: null,
        open: false
    });

    useEffect(() => {
        setFeedback({
            severity: severity,
            message: message,
            open: message !== null
        });
    }, [severity, message]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setFeedback(prevFeedBack => {
            return {
                ...prevFeedBack,
                open: false
            }
        });
    };

    return (
        <Snackbar open={feedback.open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={feedback.severity}>
            {feedback.message}
            </Alert>
      </Snackbar>
    );
};

const Simulation = ({ user }) => {

    const classes = useStyle();

    const [pageReady, setPageReady] = useState(false);
    const [frameIsReady, setFrameIsReady] = useState(false);

    const [simulations, setSimulations] = useState(null);
    const [interiors, setInteriors] = useState(null);
    const [images, setImages] = useState([]);
    const [currentInteriorIndex, setCurrentInteriorIndex] = useState(-1);

    const [insertNewImage, setInsertNewImage] = useState(false);
    const [borderWidth, setBorderWidth] = useState(defaultBorderWidth);
    const [borderColor, setBorderColor] = useState(defaultBorderColor);
    const [imageCount, setImageCount] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [currentSimulationIndex, setCurrentSimulationIndex] = useState(-1);

    const [feedback, setFeedback] = useState({
        severity: "success",
        message: null,
        key: uniqueID()
    })

    const iFrameRef = useRef(null);

    const sendMessage = useCallback((msg) => {
        iFrameRef.current.contentWindow.postMessage(msg, "*");
    }, []);

    const displayFeedback = useCallback((severity, message) => {
        setFeedback({
            severity: severity,
            message: message,
            key: uniqueID()
        });
    }, []);

    const displaySimulation = useCallback((simulationData) => {
        if (simulationData === null) {
            return;
        }

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

    const handleMessageEvent = useCallback((messageEvent) => {
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
                    let name = null;
                    if (currentSimulationIndex >= 0) {
                        name = simulations[currentSimulationIndex].name;
                    }
                    saveLocalSimulation(message.data, true /* isDirty */, name);
                } else {
                    /* Keep export feature ??
                    wixWindow.openLightbox("SimulationExport", message.data).then(fileUrl => {
                        wixLocation.to(fileUrl);
                    });
                    */
                }
                setIsDirty(true);
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
    }, [simulations, currentSimulationIndex, interiors, currentInteriorIndex]);

    useEffect(() => {
        if (frameIsReady) {
            sendMessage({
                action: 'device',
                device: 'desktop' // TODO 'mobile'
            });
        }
    }, [frameIsReady, sendMessage]);

    useEffect(() => {
        window.addEventListener("message", handleMessageEvent)
        // clean up
        return () => window.removeEventListener("message", handleMessageEvent)
    }, [handleMessageEvent]);

    // load simulations if connected
    // -> simulations won't be null after this hook execution
    useEffect(() => {
        if (user !== null) {
            dataProvider.getSimulations().then(res => {
                setSimulations(res);
            })
        } else {
            setSimulations([]);
        }
    }, [user]);

    // Load interiors
    useEffect(() => {
        dataProvider.getInteriors().then(interiors => {
            unstable_batchedUpdates(() => {
                setInteriors(interiors.map((interior, index) => {
                    return {
                        src: interior,
                        id: index
                    }
                }));
                setCurrentInteriorIndex(0);
            });
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

    // Load possible simulation from local storage and merge with user simulations if needed
    useEffect(() => {
        if (pageReady === true ||      // The page is already initialized (don(t display the simulation twice)
            frameIsReady ===  false || // Wait for the iFrame being loaded and ready
            interiors === null ||      // Wait for the interiors to be loaded (need to update the selected interior)
            simulations === null) {    // Wait for the possible user simulations being loaded (!= null)
            return;
        }

        let currentSimulation = getLocalSimulation();
        if (currentSimulation !== null) {
            if (currentSimulation.name !== null && simulations.length > 0) {
                // The locally stored simulation has a name
                // -> find the corresponding user simulation
                const simulationIndex = simulations.findIndex(simulation => simulation.name === currentSimulation.name);
                if (simulationIndex !== -1) {
                    unstable_batchedUpdates(() => {
                        setCurrentSimulationIndex(simulationIndex);
                        setIsDirty(currentSimulation.isDirty);
                    });
                }
            }
        }

        displaySimulation(currentSimulation);
        setPageReady(true);

    }, [frameIsReady, interiors, simulations, displaySimulation])

    const onSave = useCallback((name) => {
        // if name is undefined, just save the current simulation without modifying the name
        // if name is defined, eiher save a new simulation (currentSimulationIndex = -1),
        // or just update the current one (currentSimulationIndex != -1)
        if (currentSimulationIndex === -1) {
            // The name must be defined
            if (!name) {
                console.error("The current index is -1 -> a name must de defined");
                displayFeedback("error", "The current index is -1 -> a name must de defined");
                // TODO : show error message
                return;
            }
            // get the data from the local storage
            const projectData = getLocalSimulation();
            if (projectData === null) {
                console.error("The local storage deos not contain any data...");
                displayFeedback("error", "The local storage deos not contain any data...");
                return;
            }

            // Update the project name and set isDirty as false (it will be saved)
            saveLocalSimulation(projectData, false /* not dirty */, name);

            dataProvider.addSimulation(projectData).then(res => {
                // Res contains the new simulations
                // TODO update simulations
                unstable_batchedUpdates(() => {
                    setIsDirty(false);
                    setSimulations(res);
                    setCurrentSimulationIndex(res.findIndex(simulation => simulation.name === name));
                    displayFeedback("success", `The simulation '${name}' has been saved.`);
                });
            }).catch (err => {
                console.error("error while saving the simulation:");
                console.error(err);
                displayFeedback("error", "Error while saving the simulation...");
            })
        } else {
            // Save the current simulation
            const simulationToUpdate = simulations[currentSimulationIndex];
            if (simulationToUpdate === undefined) {
                console.error("The simulation to update must contain a valid index");
                displayFeedback("error", "The simulation to update must contain a valid index");
            }
            const projectData = getLocalSimulation();
            projectData.index = simulationToUpdate.index;
            saveLocalSimulation(projectData, false /* not dirty */); // Keep same name
            dataProvider.updateSimulation(projectData).then(res => {
                unstable_batchedUpdates(() => {
                    setIsDirty(false);
                    setSimulations(res);
                    displayFeedback("success", `The simulation '${projectData.name}' has been saved.`);
                });
            });
        }

    }, [currentSimulationIndex, simulations, displayFeedback]);

    const onDelete = useCallback(() => {
        if (currentSimulationIndex < 0) {
            // Must not happen...
            displayFeedback("error", "The current simulation index is not valid.");
            return;
        }

        const simulationToRemove = simulations[currentSimulationIndex];
        const simulationIndex = simulationToRemove.index;

        if (simulationIndex === null || simulationIndex === undefined) {
            displayFeedback("error", `The simulation '${simulationToRemove.name}' shall contain an index and cannot be removed.`);
        }

        dataProvider.removeSimulation(simulationToRemove.index).then(res => {
            const newSimulationIndex = (res && res.length > 0) ? 0 : -1;
            if (newSimulationIndex >= 0) {
                // Load the first user simulation
                const simulationData = res[newSimulationIndex];
                saveLocalSimulation(simulationData, false);
            } else {
                // Back to an empty simulation
                // TODO
            }
            unstable_batchedUpdates(() => {
                setIsDirty(false);
                setSimulations(res);
                setCurrentSimulationIndex(newSimulationIndex);
                displayFeedback("success", `The simulation '${simulationToRemove.name}' has been removed.`);
            });
        });

    }, [currentSimulationIndex, simulations, displayFeedback]);

    const onInteriorClick = useCallback((interiorIndex) => {
        const projectData = getLocalSimulation();
        projectData.background = interiors[interiorIndex].src;
        saveLocalSimulation(projectData, true /* is dirty */); // Keep same name
        unstable_batchedUpdates(() => {
            setIsDirty(true);
            setCurrentInteriorIndex(interiorIndex);
        })
    }, [interiors]);
    
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

            {
                user && pageReady &&
                <SimulationToolBar
                    simulations={simulations}
                    currentIndex={currentSimulationIndex}
                    dirty={isDirty}
                    onSave={onSave}
                    onDelete={onDelete}
                />
            }

            <FeedbackMessage severity={feedback.severity} message={feedback.message} key={feedback.key}/>

            <PageTitle>Simulation</PageTitle>
            <VerticalSpacing factor={3} />
            <Typography variant="h4" style={{fontWeight: "100"}}>1. Sélectionnez une ambiance d'intérieur</Typography>
            <ImageSlider
                images={interiors ?? []}
                currentIndex={currentInteriorIndex}
                onThumbnailClick={onInteriorClick}
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

const SimulationConsumer = (props) => {
    return (
        <AuthContext.Consumer>
            { ({user, data, updateUserContext}) => {
                return (
                    <Simulation
                        user={user}
                        updateUserContext={updateUserContext}
                        {...props}
                    />
                );
            }}
        </AuthContext.Consumer>
    );
}

export default SimulationConsumer;