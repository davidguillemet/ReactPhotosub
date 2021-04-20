import React, { useEffect, useState, useRef, useCallback } from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ImageSlider from '../../components/imageSlider';
import dataProvider from '../../dataProvider';

const placeHolder = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=`;

const Simulation = () => {

    const [interiors, setInteriors] = useState([]);
    const [currentInteriorIndex, setCurrentInteriorIndex] = useState(-1);
    const [frameIsReady, setFrameIsReady] = useState(false);
    const iFrameRef = useRef(null);

    const sendMessage = useCallback((msg) => {
        console.log("sendMessage:");
        console.log(msg);
        iFrameRef.current.contentWindow.postMessage(msg, "*");
    }, []);

    useEffect(() => {
        if (frameIsReady) {
            sendMessage({
                action: 'device',
                device: 'desktop' // TODO 'mobile'
            });
        }
    }, [frameIsReady, sendMessage]);

    const iFrameRefCallback = useCallback((node) => {
        if (node !== null) {
            iFrameRef.current = node;
        }
    }, []);

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
                    /*
                    imageCount = message.count;
                    if (imageCount === 0) {
                        // Deactivate checkbox "add new image"
                        $w("#addImageCheckbox").checked = false;
                        $w("#addImageCheckbox").disable();
                    } else {
                        $w("#addImageCheckbox").enable();
                    }
                    */
                    break;
                }
                case "export":
                {
                    // Add the background url
                    //message.data["background"] = interiors[currentInteriorIndex].src;
        
                    /*
                    if (message.target === 'save') {
                        // Save in local storage
                        local.setItem("simulation", JSON.stringify(message.data));
                    } else {
                        wixWindow.openLightbox("SimulationExport", message.data).then(fileUrl => {
                            wixLocation.to(fileUrl);
                        });
                    }*/
                    break;
                }
                case "border":
                {
                    /*
                    // The border has been changed in the frame
                    switch (message.property)
                    {
                        case 'border-width':
                        {
                            setBorderWidth(message.value, false, true);
                        }
                    }*/
                    break;
                }
                case 'lock':
                {
                    //isLocked = message.isLocked;
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
    }, []);

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
    }, [])
    
    function setCurrentIndex(index) {
        setCurrentInteriorIndex(index);
        // TODO : display current interior
    }

    const baseUrl = window.location.origin;

    return (
        <React.Fragment>
            <Typography variant="h2">Simulation</Typography>
            <ImageSlider
                images={interiors}
                currentIndex={currentInteriorIndex}
                onThumbnailClick={setCurrentIndex}
                style={{
                    width: '100%'
                }}
                imageHeight={120}
                imageBorderWidth={3}
                imageBorderRadius={5}
            />
            <Box style={{
                width: '100%',
                maxWidth: 1200,
                position: 'relative'
            }}>
                <img
                    alt=""
                    src={currentInteriorIndex >= 0 ? interiors[currentInteriorIndex].src : placeHolder}
                    style={{
                        width: '100%'
                    }}
                />
                <iframe
                    ref={iFrameRefCallback}
                    title="Simulation Frame"
                    frameBorder="0"
                    src={`${baseUrl}/dragdrop_indicator_container.html`}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}>
                </iframe>
            </Box>
        </React.Fragment>
    );
};

export default Simulation;