import { useEffect, useState, useCallback } from 'react';
import { uniqueID } from 'utils';
import { useQueryContext } from 'components/queryContext';
import { useQueryClient } from '@tanstack/react-query';
import { useReactQuery } from 'components/reactQuery';
import { usePortfolio } from 'providers';

export const LIST_HOME_SLIDESHOW = "list::slideshow";
export const LIST_FAVORITES = "list::favorites";
export const LIST_SEARCH = "list::search";
export const LIST_INTERIORS = "list::interiors";

const emptyArray = [];

const useFetchSource = (listType, user, thenFunc) => {

    const { portfolio } = usePortfolio();
    const queryContext = useQueryContext();

    const { data: favorites } = useReactQuery(queryContext.useFetchFavorites, [user && user.uid, listType === LIST_FAVORITES, thenFunc]);
    const { data: searchResult } = useReactQuery(queryContext.useFetchSearchResults, [listType === LIST_SEARCH, thenFunc]);

    switch (listType) {
        case LIST_HOME_SLIDESHOW: return portfolio;
        case LIST_FAVORITES: return favorites;
        case LIST_SEARCH: return searchResult;
        default: throw new Error(`Unexpected list type '${listType}'`)
    }
}

const useImageLoader = (user, simulations, listType) => {
    const queryContext = useQueryContext();
    const [allInteriors, setAllInteriors] = useState(null);

    const queryClient = useQueryClient();
    const { data: interiors } = useReactQuery(queryContext.useFetchInteriors, [(images) => buildImages(images, false)], {
            errorPlaceholder: emptyArray // Empty array on error...not blocking
        });
    const { data: userInteriors } = useReactQuery(queryContext.useFetchUserInteriors, [
            user && user.uid,
            (images) => buildImages(images, true)
        ], {
            errorPlaceholder: emptyArray // Empty array on error...not blocking
        });
    const removeUserInterior = queryContext.useRemoveUserInterior();
    const images = useFetchSource(listType, user, (images) => images.map(image => {
        return {
            ...image,
            id: uniqueID()
        }
    }));

    const userInteriorIsUsed = useCallback((userInteriorUrl) => {
        // Check is any simulation contains the current background
        return simulations.findIndex((simulation) => {
            // background is now an image object with src, sizeRatio and version
            if (typeof simulation.background === 'string') {
                return simulation.background === userInteriorUrl;
            }
            return simulation.background.src === userInteriorUrl;
        }) === -1;
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

    const addUploadedInterior = useCallback((fileArray, infoArray) => {
        const queryKey = ['userInteriors', user.uid];
        // Add the new uploaded image to the user interiors' array
        // --> merge existing images in case the same image has been uploaded multiple times
        const images = fileArray.map((fileSrc, index) => {
            const fileInfo = infoArray[index];
            return buildImage({
                src: fileSrc,
                sizeRatio: fileInfo.sizeRatio,
                version: fileInfo.version
            }, true);
        });
        const previousUserInteriors = queryClient.getQueryData(queryKey) || [];
        // Keep the previous uploaded images that are still present in the user interiors' array and that have not the same src than the new images
        const filteredPreviousUserInteriors = previousUserInteriors.filter(prevImage => !images.find(newImage => newImage.src === prevImage.src));
        queryClient.setQueryData(queryKey, [
            ...images,
            ...filteredPreviousUserInteriors
        ]);
    }, [buildImage, queryClient, user]);

    const deleteUploadedInterior = useCallback((fileUrl) => {
        // Extract the file name from the src
        const decodedFileUrl = decodeURIComponent(fileUrl);
        const fileName = decodedFileUrl.substring(decodedFileUrl.lastIndexOf('/') + 1);
        removeUserInterior.mutateAsync(fileName).then(() => {
            queryClient.setQueryData(['userInteriors', user.uid], [
                ...allInteriors.filter(interior => interior.uploaded === true && interior.src !== fileUrl)
            ]);
        }).catch(err => {
            // TODO
        });
    }, [allInteriors, queryClient, removeUserInterior, user]);

    const setSearchImages = useCallback((results) => {
        queryClient.setQueryData(['searchResults'], results);
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
