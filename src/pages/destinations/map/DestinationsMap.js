
/*global google*/
import React, { useState, useEffect, useRef } from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import { GoogleMap, Marker, InfoWindow, MarkerClusterer, useLoadScript } from '@react-google-maps/api';

import dataProvider from '../../../dataProvider';
import { formatDate, getThumbnailSrc } from '../../../utils/utils';

import LocationInfoWindow from './LocationInfoWindow';

const _infoCoverWidth = 150;
const _defaultCenter = {
    lat: 34,
    lng: -40
}

const DestinationsMap = ({destinations}) => {

    const locationMapRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [destinationsPerLocation, setDestinationsPerLocation] = useState([]);
    const [map, setMap] = React.useState(null)
    const [clusterer, setClusterer] = React.useState(null)

    // Another effect to get locations
    useEffect(() => {

        const promise =
            locationMapRef.current != null ?
            Promise.resolve(locationMapRef.current) :
            dataProvider.getLocations().then(items => {
                const locationMap = new Map();
                items.forEach(location => {
                    locationMap.set(location.id, location);
                })
                locationMapRef.current = locationMap;
                return locationMap;
            });
        
        promise.then(locationMap => {
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

            unstable_batchedUpdates(() => {
                //setDestinationsPerLocation([ ...locationMap.values() ]);
                setDestinationsPerLocation([ ...locations.values() ]);
                setSelectedLocation(null);
            })
        })
    }, [destinations])

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
                icon: "https://static.wixstatic.com/media/e50527_e57f1250c77142098a1be8ee71f78144~mv2.png"
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
    }, [clusterer, destinationsPerLocation])
    
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

    const handleMarkerClick = (location) => {
        setSelectedLocation(location);
    };

    if (isLoaded === false) {
        return <></>;
    }

    return (
        <GoogleMap
            mapContainerStyle={{
                width: '100%',
                height: '600px'
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