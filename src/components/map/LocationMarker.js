import React from 'react';
import LocationInfoWindow from './LocationInfoWindow';
import {
    AdvancedMarker,
    InfoWindow,
    //Pin,
    useMap
} from '@vis.gl/react-google-maps';

const _infoCoverWidth = 150;

const LocationMarker = React.forwardRef(({location, isDestinationPage, onClose, onOpen, infoOpen, index}, ref) => {

    const map = useMap();

    const handleLocationClick = React.useCallback((event /* google.maps.MapMouseEvent */) => {
        map.panTo(location.position);
        onOpen(index);
    }, [location, map, onOpen, index]);

    const localRef = React.useCallback((marker) => {
        ref(marker, location)
    }, [ref, location]);

    return (
        <>
            <AdvancedMarker
                position={location.position}
                ref={localRef}
                clickable={true}
                onClick={location.destinations ? handleLocationClick : null}
            >
                {
                    /*index === 0 ?
                    <Pin
                        background={'#0f9d58'}
                        borderColor={'#006425'}
                        glyphColor={'#60d98f'}
                    /> :*/
                    <img alt="location" src="/diver.png" />
                }
            </AdvancedMarker>

            {
                infoOpen &&
                <InfoWindow
                    position={location.position}
                    onClose={onClose}
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