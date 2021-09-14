import { useEffect, useState, useCallback } from 'react';
import { uniqueID } from '../../../utils';
import { useGlobalContext } from '../../../components/globalContext';
import { useQueryClient } from 'react-query';

export const LIST_HOME_SLIDESHOW = "slideshow";
export const LIST_FAVORITES = "favorites";
export const LIST_SEARCH = "search";

const useImageLoader = (user, simulations, listType) => {
    const context = useGlobalContext();
    const [allInteriors, setAllInteriors] = useState(null);

    const queryClient = useQueryClient();
    const { data: interiors } = context.useFetchInteriors((images) => buildImages(images, false));
    const { data: userInteriors } = context.useFetchUserInteriors(user && user.uid, (images) => buildImages(images, true))
    const { data: images } = context.useFetchSimulationImages(listType, (images) => images.map(image => {
        return {
            ...image,
            id: uniqueID()
        }
    }));

    const userInteriorIsUsed = useCallback((userInteriorUrl) => {
        // Check is any simulation contains the current background
        return simulations.findIndex((simulation) => simulation.background === userInteriorUrl) === -1;
    }, [simulations]);

    const buildImage = useCallback((image, uploaded) => {
        return {
            ...image,
            id: uniqueID(),
            uploaded: uploaded,
            deletable: true
        }
    }, []);

    const buildImages = useCallback((images, uploaded) => {
        return images.map((image) => buildImage(image, uploaded));
    }, [buildImage]);

    // Update the collection containing all interiors 
    useEffect(() => {
        if (interiors === undefined || userInteriors === undefined) {
            return;
        }
        setAllInteriors([...(userInteriors || []), ...interiors]);
    }, [user, interiors, userInteriors]);

    // Check the "deletable" property of the uploaded interiors
    useEffect(() => {
        if (simulations === null || userInteriors === undefined || interiors === undefined) {
            return;
        }
        let modified = false;
        for (let i = 0; i < userInteriors.length; i++) {
            const interior = userInteriors[i];
            const prevDeletable = interior.deletable;
            if (userInteriorIsUsed(interior.src)) {
                interior.deletable = false;
            } else {
                interior.deletable = true;
            }
            modified = modified || (prevDeletable !== interior.deletable);
        }
        if (modified === true) {
            setAllInteriors([ ...userInteriors, ...interiors ]);
        }
    }, [userInteriorIsUsed, simulations, userInteriors, interiors]);

    const addUploadedInterior = useCallback((fileSrc) => {
        // Add the new uploaded image to the user interiors' array
        queryClient.setQueryData(['userInteriors', user.uid], [
            buildImage({src: fileSrc}, true),
            ...allInteriors.filter(image => image.uploaded === true)
        ]);
    }, [buildImage, allInteriors, queryClient, user]);

    const deleteUploadedInterior = useCallback((fileUrl) => {
        queryClient.setQueryData(['userInteriors', user.uid], [
            ...allInteriors.filter(interior => interior.uploaded === true && interior.src !== fileUrl)
        ]);
    }, [allInteriors, queryClient, user]);

    const setSearchImages = useCallback((results) => {
        queryClient.setQueryData(['simulationImages', 'search'], results);
    }, [queryClient])

    return [
        allInteriors,
        images,
        setSearchImages,
        addUploadedInterior,
        deleteUploadedInterior
    ];
}

export default useImageLoader;
