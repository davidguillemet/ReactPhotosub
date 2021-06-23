
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow, MarkerClusterer, useJsApiLoader } from '@react-google-maps/api';

import dataProvider from '../../../dataProvider';
import { formatDate, getThumbnailSrc } from '../../../utils/utils';

import LocationInfoWindow from './LocationInfoWindow';

const LocationMarker = ({clusterer, location, onClick}) => {

    const handleMarkerClick = () => {
        onClick(location);
    }

    return (
        <Marker
            key={location.id}
            position={{
                lat: location.latitude,
                lng: location.longitude
            }}
            clusterer={clusterer}
            icon="diver.png"
            onClick={handleMarkerClick}
        />
    );
}

const _infoCoverWidth = 150;

const DestinationsMap = ({destinations}) => {

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [destinationsPerLocation, setDestinationsPerLocation] = useState([]);

    // Another effect to get locations
    useEffect(() => {
        dataProvider.getLocations().then(items => {
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
            setDestinationsPerLocation([ ...items ]);
            //setDestinationsPerLocation([ ...locations.values() ]);
        })
    }, [destinations])
    
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        // The google ma^API keys are restricted (IP and HTTP referrer)
        googleMapsApiKey: process.env.REACT_APP_GMAP_API_KEY
    })

    const [map, setMap] = React.useState(null)
    const [clusterer, setClusterer] = React.useState(null)

    const handleMapLoaded = React.useCallback((map) => {
        // Center in the middle of the atlantic ocean
        map.setCenter({lat: 34, lng: -40});
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
                    (clusterer) =>
                        destinationsPerLocation.map((location) => {
                            return <LocationMarker
                                        key={location.id}
                                        clusterer={clusterer}
                                        location={location}
                                        onClick={handleMarkerClick}
                                    />
                        })
                }
            </MarkerClusterer>
            {
                selectedLocation &&
                <InfoWindow
                    onCloseClick={() => {
                        setSelectedLocation(null);
                    }}
                    position={{
                        lat: selectedLocation.latitude + 13,
                        lng: selectedLocation.longitude
                    }}
                >
                    <LocationInfoWindow location={selectedLocation} coverWidth={_infoCoverWidth} />
                </InfoWindow>
            }
        </GoogleMap>
    );
}

export default DestinationsMap;