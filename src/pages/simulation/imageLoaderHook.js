import { useEffect, useState, useCallback } from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import dataProvider from '../../dataProvider';
import { uniqueID } from '../../utils';

export const LIST_HOME_SLIDESHOW = "slideshow";
export const LIST_FAVORITES = "favorites";
export const LIST_SEARCH = "search";

const useImageLoader = (user, simulations, listType) => {
    const [interiors, setInteriors] = useState(null);
    const [userInteriors, setUserInteriors] = useState(null);
    const [allInteriors, setAllInteriors] = useState(null);
    const [images, setImages] = useState(null);

    const [imagesBySource, setImagesBySource] = useState({
        [LIST_HOME_SLIDESHOW]: null,
        [LIST_FAVORITES]: null,
        [LIST_SEARCH]: null,
    });

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

    // Load interiors
    useEffect(() => {
        dataProvider.getInteriors().then(images => {
            unstable_batchedUpdates(() => {
                const defaultInteriors = buildImages(images, false);
                setInteriors(defaultInteriors);
            });
        })
    }, [buildImages]);

    // Load user uploaded interiors
    useEffect(() => {
        const loadPromise =
            user === null ?
            Promise.resolve([]) :
            dataProvider.getUploadedInteriors();
        
        loadPromise.then(images => {
            unstable_batchedUpdates(() => {
                const userInteriors = buildImages(images, true);
                setUserInteriors(userInteriors);
            });
        })
    }, [user, buildImages]);

    // Update the collection containing all interiors 
    useEffect(() => {
        if (interiors === null || userInteriors === null) {
            return;
        }
        unstable_batchedUpdates(() => {
            setAllInteriors([...userInteriors, ...interiors]);
        });
    }, [interiors, userInteriors]);

    // Check the "deletable" property of the uploaded interiors
    useEffect(() => {
        if (simulations === null || userInteriors === null || interiors == null) {
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

    // Load images from current source (homeslideshow, favorites, search)
    useEffect(() => {
        setImages(null);

        if (imagesBySource[listType] !== null) {
            setImages(imagesBySource[listType]);
            return;
        }

        const promise =
            listType === LIST_HOME_SLIDESHOW ? dataProvider.getImageDefaultSelection() :
            listType === LIST_FAVORITES ? dataProvider.getFavorites() : 
            Promise.resolve([]); // initialize the search with an empty list

        promise.then(images => {
            const newImages = images.map(image => {
                return {
                    ...image,
                    id: uniqueID()
                }
            });
            unstable_batchedUpdates(() => {
                setImagesBySource(prevImagesBySource => {
                    return {
                        ...prevImagesBySource,
                        [listType]: newImages
                    };
                })
                setImages(newImages);
            });
        })
    }, [listType, imagesBySource]);

    const addUploadedInterior = useCallback((fileSrc) => {
        // Add the new uploaded image to the user interiors' array
        setUserInteriors(prevInteriors => [
           buildImage({src: fileSrc}, true),
           ...prevInteriors
        ]);
    }, [buildImage]);

    const deleteUploadedInterior = useCallback((fileUrl) => {
        setUserInteriors(prevInteriors => {
            return prevInteriors.filter(interior => interior.src !== fileUrl);
        });
    }, []);

    return [
        allInteriors,
        images,
        setImages,
        addUploadedInterior,
        deleteUploadedInterior
    ];
}

export default useImageLoader;
