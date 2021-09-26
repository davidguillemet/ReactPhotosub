
/*global google*/
import React, { useState, useEffect } from 'react';
import { useRouteMatch } from "react-router-dom";
import {unstable_batchedUpdates} from 'react-dom';
import { GoogleMap, InfoWindow, MarkerClusterer, useLoadScript } from '@react-google-maps/api';
import { useGlobalContext } from '../globalContext';
import { formatDate, getThumbnailSrc } from '../../utils';
import { DestinationPath } from '../../navigation/routes';

import LocationInfoWindow from './LocationInfoWindow';

const _infoCoverWidth = 150;
const _defaultCenter = {
    lat: 34,
    lng: -40
}

const DestinationsMap = ({destinations}) => {

    const isDestinationPage = useRouteMatch(DestinationPath);

    const context = useGlobalContext();

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [destinationsPerLocation, setDestinationsPerLocation] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [map, setMap] = React.useState(null)
    const [clusterer, setClusterer] = React.useState(null)
    const [openInfoWindow, setOpenInfoWindow] = useState(true);

    const { data: locations} = context.useFetchLocations(
        // Fetch locations only for the Destinations page
        destinations !== null && isDestinationPage === null,
        (items) => {
            const locationMap = new Map();
            items.forEach(location => {
                locationMap.set(location.id, location);
            })

            const locations = new Map();
            destinations.forEach(destination => {
    
                const modifiedDestination = {
                    ...destination,
                    date: formatDate(new Date(destination.date)),
                    cover: getThumbnailSrc(destination.cover, _infoCoverWidth)
                };
                let locationInstance;
                if (locations.has(destination.location)) {
                    locationInstance = locations.get(destination.location);
                } else {
                    locationInstance = { ...locationMap.get(destination.location) }
                    locationInstance.destinations = [];
                    locations.set(destination.location, locationInstance);
                }
                locationInstance.destinations.push(modifiedDestination);    
            });

            return locations;
        }
    );

    // Another effect to get locations
    useEffect(() => {

        if (destinations !== null && isDestinationPage !== null) {
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
    }, [destinations, isDestinationPage]);

    useEffect(() => {

        if (locations === undefined) {
            return;
        }
        unstable_batchedUpdates(() => {
            setDestinationsPerLocation([ ...locations.values() ]);
            setSelectedLocation(null);
        })
    }, [locations]);

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
    
    const { isLoaded } = useLoadScript({
        id: 'google-map-script',
        // The google maps API keys are restricted (IP and HTTP referrer)
        googleMapsApiKey: process.env.REACT_APP_GMAP_API_KEY
    })

    const handleMapLoaded = React.useCallback((map) => {
        // Center in the middle of the atlantic ocean
        map.setCenter(_defaultCenter);
        map.setZoom(2);
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
        <GoogleMap
            mapContainerStyle={{
                width: '100%',
                height: '100%'
            }}
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
    );
}

export default DestinationsMap;