/*global google*/
import React from 'react';
import {isMobile} from 'react-device-detect';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import {
    APIProvider,
    ControlPosition,
    Map as GMap,
    MapControl,
    useMap
} from '@vis.gl/react-google-maps';
import { MarkerClusterer, NoopAlgorithm } from '@googlemaps/markerclusterer';
import {isIOS} from 'react-device-detect';
import { withLoading, buildLoadingState } from 'components/hoc';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Portal } from '@mui/base/Portal';
import { IconButton } from '@mui/material';
import { uniqueID } from 'utils';

import LocationMarker from './LocationMarker';
import { useDarkMode } from 'components/theme';

const _locationKey = "id"; // We should get the location id from the destinations...

// Center in the middle of the atlantic ocean
const _defaultCenter = {
    lat: 34,
    lng: -40
}
const _defaultZoom = 2;
const _mapControlIconMargin = isMobile ? 2 : 4;
const _mapControlSize = isMobile ? 20 : 24;
const _mapControlIconStyle = {color: grey[700]};

const MapControlIconButton = styled(IconButton)(({ theme }) => `
    border-radius: 2px;
    box-shadow: var(--cm-sys-elevation-level1, 0 1px 3px 0 rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 2px 1px -1px rgba(0, 0, 0, .12));
    margin: 7px;
    background-color: white;
    :hover {
        background-color: white;
    };
    width: ${_mapControlIconMargin + _mapControlSize}px;
    height: ${_mapControlIconMargin + _mapControlSize}px;
`);

const FullScreenIconButton = ({fullScreen, onClick}) => {
    return (
        <MapControlIconButton onClick={onClick} >
        {
            fullScreen ?
            <FullscreenExitIcon fontSize={isMobile ? 'small' : 'medium'} sx={_mapControlIconStyle} /> :
            <FullscreenIcon fontSize={isMobile ? 'small' : 'medium'} sx={_mapControlIconStyle} />
        }
        </MapControlIconButton>
    );
};

const FitMapToMarkersIconButton = ({disabled, onClick}) => {
    return (
        <MapControlIconButton
            disabled={disabled}
            onClick={onClick}
        >
            <GpsFixedIcon fontSize={isMobile ? 'small' : 'medium'} sx={_mapControlIconStyle} />
        </MapControlIconButton>
    );
};

export const LocationsMapNativeUI = withLoading(({
    locations,
    resetOnChange = true,
    onMapClick,
    isDestinationPage = false}) => {

    const { darkMode } = useDarkMode();
    const map = useMap();
    const [markers, setMarkers] = React.useState({});
    const [fullScreen, setFullScreen] = React.useState(false);
    const clusterer = React.useRef(null);
    const fullScreenContainer = React.useRef(null);

    const onClickFullScreen = React.useCallback(() => {
        setFullScreen(prev => !prev);
    }, []);

    // Create a new Clusterer when toggling fullscreen
    React.useEffect(() => {
        if (!map) return;
        const clustererOptions = {
            map: map,
            ...(isDestinationPage && { algorithm: new NoopAlgorithm() })
        };
        clusterer.current = new MarkerClusterer(clustererOptions);
    }, [fullScreen, map, isDestinationPage]);

/*
    React.useEffect(() => {
        const itinerary = locations.map(location => {
            return location.position;
        });
        const flightPath = new google.maps.Polyline({
            path: itinerary,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        flightPath.setMap(map);
    }, [locations, map]);
*/

    const fitMapToMarkers = React.useCallback(() => {
        const bounds = new google.maps.LatLngBounds();
        if (clusterer.current.clusters.length === 0) {
            if (isDestinationPage) {
                // clustering has been disabled:
                const markersArray = Object.values(markers);
                markersArray.forEach(marker => {
                    bounds.extend(marker.location.position);
                });
                map.fitBounds(bounds);
            }
        } else if (clusterer.current.clusters.length === 1) {
            // Just set the center as the single location
            map.setCenter(clusterer.current.clusters[0].position);
        } else {
            clusterer.current.clusters.forEach(cluster => {
                bounds.extend(cluster.position);
            });
            map.fitBounds(bounds);
        }
    }, [map, markers, isDestinationPage]);

    React.useEffect(() => {
        if (!map || !clusterer.current) return;
        clusterer.current.clearMarkers();
        const markersArray = Object.values(markers);
        clusterer.current.addMarkers(markersArray);
        const setZoom = resetOnChange === true;
        if (markersArray.length === 0) {
            if (setZoom) {
                map.setZoom(_defaultZoom);
            }
            map.panTo(_defaultCenter);
        } else if (markersArray.length === 1) {
            if (setZoom) {
                map.setZoom(8);
            }
            map.panTo(markersArray[0].location.position);
        } else {
            fitMapToMarkers();
        }
    }, [resetOnChange, fitMapToMarkers, markers, map]);

    React.useEffect(() => {
        if (!map || !onMapClick) return;
        const eventListener = map.addListener("click", (mapsMouseEvent) => {
            const position = mapsMouseEvent.latLng;
            onMapClick(position.toJSON());
        });
        return () => {
            google.maps.event.removeListener(eventListener);
        }
    }, [map, onMapClick]);

    const setMarkerRef = React.useCallback((marker, location) => {
        const key = location[_locationKey];
        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;

        setMarkers(prev => {
            let newMarkers = null;
            if (marker) {
                marker.location = location;
                newMarkers = {...prev, [key]: marker};
            } else {
                newMarkers = {...prev};
                delete newMarkers[key];
            }
            return newMarkers;
        });
    }, [markers]);

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                borderRadius: '5px',
                overflow: 'hidden'
            }}
        >
            <Portal container={fullScreenContainer.current} disablePortal={!fullScreen}>

            <GMap
                style={{
                    width: '100%',
                    height: '100%'
                }}
                controlSize={_mapControlSize + _mapControlIconMargin}
                defaultZoom={_defaultZoom}
                defaultCenter={ _defaultCenter }
                gestureHandling="cooperative" // For mobile device,
                streetViewControl={false}
                disableDefaultUI={false}
                mapId={darkMode ? "e0a208ca413d2495" : "c5d263b03424670c"}
                onCameraChanged={ (event /* MapCameraChangedEvent */) => {
                    //console.log('camera changed:', event.detail.center, 'zoom:', event.detail.zoom)
                }}
            >
                {
                    isIOS &&
                    <MapControl position={ControlPosition.RIGHT_TOP}>
                        <FullScreenIconButton fullScreen={fullScreen} onClick={onClickFullScreen} />
                    </MapControl>
                }

                <MapControl position={ControlPosition.RIGHT_TOP}>
                    <FitMapToMarkersIconButton onClick={fitMapToMarkers} disabled={Object.values(markers).length === 0} />
                </MapControl>

                {
                    locations.map((location, index) => (
                        <LocationMarker
                            key={location[_locationKey]}
                            location={location}
                            ref={setMarkerRef}
                            isDestinationPage={isDestinationPage}
                            index={index}
                        />
                    ))
                }

            </GMap>

            </Portal>

            <Dialog
                fullScreen={true}
                fullWidth={true}
                open={fullScreen}
                sx={{
                    '& .MuiDialog-paper': {
                        height: '100%'
                    }
                }}
            >
                <DialogContent
                    ref={fullScreenContainer}
                    sx={{
                        mt: 0,
                        px: 0,
                        py: 0,
                        height: '100%'
                    }}
                >
                </DialogContent>
            </Dialog>

        </Box>
    )
}, [buildLoadingState("locations", [null])]);

export const LocationsMapNative = (props) => {

    const { locations, ...rest } = props;

    const [ locationsArray, setLocationsArray ] = React.useState(null);

    React.useLayoutEffect(() => {
        const locationArray = 
            locations === null || locations === undefined ? [] :
            Array.isArray(locations) ? locations :
            isNaN(locations.latitude) || isNaN(locations.longitude) ? [] :
            [locations];
        const locationsWithPosition = locationArray.map((location) => ({
            ...location,
            position: {
                lat: location.latitude,
                lng: location.longitude
            }
        }));
        locationsWithPosition.forEach(location => {
            if (!location.id) {
                location.id = uniqueID();
            }
        });
        setLocationsArray(locationsWithPosition);
    }, [locations]);

    const onGoogleMapApiLoaded = React.useCallback(() => {
        // Empty...
    }, []);

    return (
        <APIProvider apiKey={process.env.REACT_APP_GMAP_API_KEY} onLoad={onGoogleMapApiLoaded}>
            <LocationsMapNativeUI locations={locationsArray} {...rest} />
        </APIProvider>
    );
};
