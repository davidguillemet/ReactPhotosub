
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
            setDestinationsPerLocation([ ...locations.values() ]);
        })
    }, [destinations])
    
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        // The google ma^API keys are restricted (IP and HTTP referrer)
        googleMapsApiKey: process.env.REACT_APP_GMAP_API_KEY
    })

    const [map, setMap] = React.useState(null)

    const onLoad = React.useCallback(function callback(map) {
        // Center in the middle of the atlantic ocean
        map.setCenter({lat: 34, lng: -40});
        map.setZoom(2);
        setMap(map)
    }, [])
    
    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])

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
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                gestureHandling: "cooperative" // For mobile device,
            }}
        >
            <MarkerClusterer
                averageCenter={true}
                options={{
                    imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
                    averageCenter: true,
                    gridSize: 20
                }}
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