
/*global google*/
import React, { useState, useEffect, useCallback } from 'react';
import {isIOS} from 'react-device-detect';
import { useRouteMatch } from "react-router-dom";
import { GoogleMap, InfoWindow, MarkerClusterer, useJsApiLoader } from '@react-google-maps/api';
import { useQueryContext } from '../queryContext';
import { formatDate, getThumbnailSrc, useLanguage } from '../../utils';
import { DestinationsPath } from '../../navigation/routes';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';

import LocationDialog from './LocationDialog';
import LocationInfoWindow from './LocationInfoWindow';
import { withLoading, buildLoadingState } from '../hoc';
import { useReactQuery } from '../reactQuery';
import { useDarkMode } from 'components/theme';

const _infoCoverWidth = 150;
// Center in the middle of the atlantic ocean
const _defaultCenter = {
    lat: 34,
    lng: -40
}

const lightModeStyles = [];
const darkModeStyles = 
[
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
];

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

export const LocationsMap = ({
    locations,
    isFullScreen = false,
    onClose,
    resetOnChange = true,
    onMapClick,
    isDestinationPage = false}) => {

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        // The google maps API keys are restricted (IP and HTTP referrer)
        googleMapsApiKey: process.env.REACT_APP_GMAP_API_KEY
    })

    const { darkMode } = useDarkMode();
    const [selectedLocation, setSelectedLocation] = useState(null);

    // eslint-disable-next-line no-unused-vars
    const [map, setMap] = React.useState(null)
    const [clusterer, setClusterer] = React.useState(null);
    const mapInitialized = React.useRef(false);

    const handleMarkerClick = React.useCallback((location) => {
        setSelectedLocation(location);
    }, []);

    useEffect(() => {
        if (clusterer === null) {
            return;
        }
        clusterer.clearMarkers();
        const locationArray = 
            locations === null || locations === undefined ? [] :
            Array.isArray(locations) ? locations :
            isNaN(locations.latitude) || isNaN(locations.longitude) ? [] :
            [locations];

        const markers = locationArray.map(location => {
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
        const setZoom = resetOnChange === true || mapInitialized.current === false
        if (markers.length === 0) {
            if (setZoom) {
                clusterer.map.setZoom(2);
            }
            clusterer.map.panTo(_defaultCenter);
        } else if (markers.length === 1) {
            if (setZoom) {
                clusterer.map.setZoom(8);
            }
            clusterer.map.panTo(markers[0].getPosition());
        } else {
            clusterer.fitMapToMarkers();
        }

        if (mapInitialized.current ===  false && onMapClick) {
            clusterer.map.addListener("click", (mapsMouseEvent) => {
                const position = mapsMouseEvent.latLng;
                    onMapClick(position.toJSON());
            });
        }

        mapInitialized.current = true;
    }, [clusterer, locations, handleMarkerClick, onMapClick, resetOnChange])

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

    if (isLoaded === false) {
        return <></>;
    }

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
                gestureHandling: "cooperative", // For mobile device,
                styles: darkMode ? darkModeStyles : lightModeStyles
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
                        lat: selectedLocation.latitude,
                        lng: selectedLocation.longitude
                    }}
                    options={{
                        disableAutoPan: false,
                        pixelOffset: { height: -35 }
                    }}
                >
                    <LocationInfoWindow
                        location={selectedLocation}
                        coverWidth={_infoCoverWidth}
                        isDestinationPage={isDestinationPage}
                    />
                </InfoWindow>
            }
        </GoogleMap>
        {
            /* GMAP Fullscreen tool is not supported on iOS */
            /* Then, in this case, we create a custom button that opens a fullscreen dialog */
            isIOS && <CustomFullScreen fullScreen={isFullScreen} onClose={onClose} locations={locations} />
        }       
        </Box>
    );
}

const DestinationsMapUi = withLoading(({destinations, locations, isFullScreen = false, onClose, isDestinationPage}) => {

    const { language } = useLanguage();
    const [destinationsPerLocation, setDestinationsPerLocation] = useState([]);

    // Set destinations per location for the single destination page
    useEffect(() => {

        if (destinations !== null && isDestinationPage === true) {
            const locations = destinations.map((destination) => ({
                title: destination.title,
                latitude: destination.latitude,
                longitude: destination.longitude,
                destinations: [
                    {
                        ...destination,
                        date: formatDate(new Date(destination.date), language)
                    }
                ]
            }));
            setDestinationsPerLocation(locations);
            return;
        }
    // Don't need dependency with isDestinationPage
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinations, language]);

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
                date: formatDate(new Date(destination.date), language),
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

        setDestinationsPerLocation([ ...destinationsPerlocation.values() ]);
    // Don't need dependency with isDestinationPage
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinations, locations, language]);

    return <LocationsMap
                locations={destinationsPerLocation}
                isFullScreen={isFullScreen}
                onClose={onClose}
                isDestinationPage={isDestinationPage}
            />
}, [
    buildLoadingState("locations", [undefined])
]);

const DestinationsMapWithLocationLoader = ({destinations, isFullScreen = false, onClose}) => {

    const queryContext = useQueryContext();
    const { data: locations } = useReactQuery(queryContext.useFetchLocations);

    return <DestinationsMapUi
                destinations={destinations}
                locations={locations}
                isFullScreen={isFullScreen}
                isDestinationPage={false}
                onClose={onClose}
            />
}

export const DestinationsMap = ({destinations, isFullScreen = false, onClose}) => {

    const destinationsPageMatch = useRouteMatch({
        path: DestinationsPath,
        strict: true,
        exact: true
    });

    if (destinationsPageMatch !== null) {
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
