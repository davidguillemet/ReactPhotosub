
/*global google*/
import React, { useState, useEffect, useCallback } from 'react';
import {isIOS} from 'react-device-detect';
import { useRouteMatch } from "react-router-dom";
import {unstable_batchedUpdates} from 'react-dom';
import { GoogleMap, InfoWindow, MarkerClusterer, useJsApiLoader } from '@react-google-maps/api';
import { useGlobalContext } from '../globalContext';
import { formatDate, getThumbnailSrc } from '../../utils';
import { DestinationPath } from '../../navigation/routes';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';

import LocationDialog from './LocationDialog';
import LocationInfoWindow from './LocationInfoWindow';
import { withLoading, buildLoadingState } from '../hoc';
import { useReactQuery } from '../reactQuery';

const _infoCoverWidth = 150;
// Center in the middle of the atlantic ocean
const _defaultCenter = {
    lat: 34,
    lng: -40
}

const CustomFullScreen = ({destinations, fullScreen, onClose}) => {
    const [locationOpen, setLocationOpen] = useState(false);

    const handleCloseLocation = useCallback(() => {
        setLocationOpen(false);
    }, []);

    const handleOpenLocation = () => {
        setLocationOpen(true);
    }

    return (
        <React.Fragment>
            <Fab
                onClick={fullScreen ? onClose : handleOpenLocation}
                size="medium"
                sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                }}
            >
                {
                    fullScreen ?
                    <FullscreenExitIcon /> :
                    <FullscreenIcon />
                }
            </Fab>
            <LocationDialog
                destinations={destinations}
                open={locationOpen}
                handleClose={handleCloseLocation}
            />
        </React.Fragment>
    );
}

const DestinationsMapUi = withLoading(({destinations, locations, isFullScreen = false, onClose, isDestinationPage}) => {

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [destinationsPerLocation, setDestinationsPerLocation] = useState([]);
    const [openInfoWindow, setOpenInfoWindow] = useState(true);

    // eslint-disable-next-line no-unused-vars
    const [map, setMap] = React.useState(null)
    const [clusterer, setClusterer] = React.useState(null)

    // Set destinations per location for the single destination page
    useEffect(() => {

        if (destinations !== null && isDestinationPage === true) {
            const destination = destinations[0];
            const location = {
                title: destination.location,
                latitude: destination.latitude,
                longitude: destination.longitude,
                destinations: [ destination ]
            }
            unstable_batchedUpdates(() => {
                setDestinationsPerLocation([ location ]);
                setSelectedLocation(null);
                setOpenInfoWindow(false);
            })
            return;
        }
    // Don't need dependency with isDestinationPage
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinations]);

    // Set destinations per location for the destinations page
    useEffect(() => {

        if (isDestinationPage === true) {
            // don't update destinationsPerLocation if we are on a single destination page
            return;
        }

        const locationMap = new Map();
        locations.forEach(location => {
            locationMap.set(location.id, location);
        })

        const destinationsPerlocation = new Map();
        destinations.forEach(destination => {

            const modifiedDestination = {
                ...destination,
                date: formatDate(new Date(destination.date)),
                cover: getThumbnailSrc(destination.cover, _infoCoverWidth)
            };
            let locationInstance;
            if (destinationsPerlocation.has(destination.location)) {
                locationInstance = destinationsPerlocation.get(destination.location);
            } else {
                locationInstance = { ...locationMap.get(destination.location) }
                locationInstance.destinations = [];
                destinationsPerlocation.set(destination.location, locationInstance);
            }
            locationInstance.destinations.push(modifiedDestination);    
        });

        unstable_batchedUpdates(() => {
            setDestinationsPerLocation([ ...destinationsPerlocation.values() ]);
            setSelectedLocation(null);
        })
    // Don't need dependency with isDestinationPage
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinations, locations]);

    const handleMarkerClick = React.useCallback((location) => {
        if (openInfoWindow === true) {
            setSelectedLocation(location);
        }
    }, [openInfoWindow]);

    useEffect(() => {
        if (clusterer === null) {
            return;
        }
        clusterer.clearMarkers();
        const markers = destinationsPerLocation.map(location => {
            const marker = new google.maps.Marker({
                position: {
                    lat: location.latitude,
                    lng: location.longitude
                },
                icon: "/diver.png"
            });
            marker.addListener("click", () => handleMarkerClick(location));
            return marker;
        });
        clusterer.addMarkers(markers);
        if (markers.length === 0) {
            clusterer.map.setZoom(2);
            clusterer.map.panTo(_defaultCenter);
        } else if (markers.length === 1) {
            clusterer.map.setZoom(8);
            clusterer.map.panTo(markers[0].getPosition());
        } else {
            clusterer.fitMapToMarkers();
        }
    }, [clusterer, destinationsPerLocation, handleMarkerClick])

    const handleMapLoaded = React.useCallback((map) => {
        setMap(map)
    }, [])

    const handleMapUnmount = React.useCallback((map) => {
        setMap(null)
    }, [])

    const handleClustererLoaded = React.useCallback(clusterer => {
        setClusterer(clusterer);
    }, []);

    const handleClustererUnmount = React.useCallback(clusterer => {
        setClusterer(null);
    }, []);

    return (
        <Box sx={{
            width: "100%",
            height: "100%",
            position: "relative"
        }}
        >
        <GoogleMap
            mapContainerStyle={{
                width: '100%',
                height: '100%'
            }}
            zoom={2}
            center={_defaultCenter}
            onLoad={handleMapLoaded}
            onUnmount={handleMapUnmount}
            options={{
                gestureHandling: "cooperative" // For mobile device,
            }}
        >
            <MarkerClusterer
                averageCenter={true}
                imagePath={"https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"}
                gridSize={20}
                onLoad={handleClustererLoaded}
                onUnmount={handleClustererUnmount}
            >
                {
                    (clusterer) => (null)
                }
            </MarkerClusterer>
            {
                selectedLocation &&
                <InfoWindow
                    onCloseClick={() => {
                        setSelectedLocation(null);
                    }}
                    position={{
                        lat: selectedLocation.latitude + 0.2,
                        lng: selectedLocation.longitude
                    }}
                    options={{
                        disableAutoPan: false
                    }}
                >
                    <LocationInfoWindow location={selectedLocation} coverWidth={_infoCoverWidth} />
                </InfoWindow>
            }
        </GoogleMap>
        {
            /* GMAP Fullscreen tool is not supported on iOS */
            /* Then, in this case, we create a custom button that opens a fullscreen dialog */
            isIOS && <CustomFullScreen fullScreen={isFullScreen} onClose={onClose} destinations={destinations} />
        }       
        </Box>
    );
}, [
    buildLoadingState("locations", [undefined])
]);

const DestinationsMapWithLocationLoader = ({destinations, isFullScreen = false, onClose}) => {

    const context = useGlobalContext();
    const { data: locations } = useReactQuery(context.useFetchLocations);

    return <DestinationsMapUi
                destinations={destinations}
                locations={locations}
                isFullScreen={isFullScreen}
                isDestinationPage={false}
                onClose={onClose}
            />
}

const DestinationsMap = ({destinations, isFullScreen = false, onClose}) => {

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        // The google maps API keys are restricted (IP and HTTP referrer)
        googleMapsApiKey: process.env.REACT_APP_GMAP_API_KEY
    })

    const destinationPageMatch = useRouteMatch(DestinationPath);

    if (isLoaded === false) {
        return <></>;
    }

    if (destinationPageMatch === null) {
        // Destinations page = need to load locations
        return <DestinationsMapWithLocationLoader
                    destinations={destinations}
                    isFullScreen={isFullScreen}
                    onClose={onClose}
                />
    } else {
        // Destination page = no need to load locations
        return <DestinationsMapUi
                    destinations={destinations}
                    locations={null}
                    isFullScreen={isFullScreen}
                    isDestinationPage={true}
                    onClose={onClose}
                />
    }
}

export default DestinationsMap;