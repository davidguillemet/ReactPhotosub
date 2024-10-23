import React from 'react';
import LocationInfoWindow from './LocationInfoWindow';
import {
    AdvancedMarker,
    InfoWindow,
    useMap
} from '@vis.gl/react-google-maps';

const _infoCoverWidth = 150;

const LocationMarker = React.forwardRef(({location, isDestinationPage}, ref) => {

    const map = useMap();
    const [infoWindowShown, setInfoWindowShown] = React.useState(false);

    const handleLocationClick = React.useCallback((event /* google.maps.MapMouseEvent */) => {
        map.panTo(location.position);
        setInfoWindowShown(true);
    }, [location, map]);

    const localRef = React.useCallback((marker) => {
        ref(marker, location)
    }, [ref, location]);

    const handleClose = React.useCallback(() => setInfoWindowShown(false), []);

    return (
        <>
            <AdvancedMarker
                position={location.position}
                ref={localRef}
                clickable={true}
                onClick={location.destinations ? handleLocationClick : null}
            >
                <img alt="location" src="/diver.png" />
            </AdvancedMarker>

            {
                infoWindowShown &&
                <InfoWindow
                    position={location.position}
                    onClose={handleClose}
                    disableAutoPan={false}
                    pixelOffset={[0,0]}
                >
                    <LocationInfoWindow
                        location={location}
                        coverWidth={_infoCoverWidth}
                        isDestinationPage={isDestinationPage}
                    />
                </InfoWindow>
            }
        </>
    );
});

export default LocationMarker;