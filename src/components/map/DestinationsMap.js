
import React, { useState, useEffect } from 'react';
import { useRouteMatch } from "react-router-dom";
import { useQueryContext } from '../queryContext';
import { formatDate, getThumbnailSrc, useLanguage } from '../../utils';
import { DestinationsPath } from '../../navigation/routes';

import { withLoading, buildLoadingState } from '../hoc';
import { useReactQuery } from '../reactQuery';
import { LocationsMapNative } from './LocationsMapNative';

const _infoCoverWidth = 150;

const DestinationsMapUi = withLoading(({destinations, locations, onClose, isDestinationPage}) => {

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

    return <LocationsMapNative
                locations={destinationsPerLocation}
                onClose={onClose}
                isDestinationPage={isDestinationPage}
            />
}, [
    buildLoadingState("locations", [undefined])
]);

const DestinationsMapWithLocationLoader = ({destinations, onClose}) => {

    const queryContext = useQueryContext();
    const { data: locations } = useReactQuery(queryContext.useFetchLocations);

    return <DestinationsMapUi
                destinations={destinations}
                locations={locations}
                isDestinationPage={false}
                onClose={onClose}
            />
}

export const DestinationsMap = ({destinations, onClose}) => {

    const destinationsPageMatch = useRouteMatch({
        path: DestinationsPath,
        strict: true,
        exact: true
    });

    if (destinationsPageMatch !== null) {
        // Destinations page = need to load locations
        return <DestinationsMapWithLocationLoader
                    destinations={destinations}
                    onClose={onClose}
                />
    } else {
        // Destination page = no need to load locations
        return <DestinationsMapUi
                    destinations={destinations}
                    locations={null}
                    isDestinationPage={true}
                    onClose={onClose}
                />
    }
}
