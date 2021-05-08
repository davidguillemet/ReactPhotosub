import { useEffect, useState, useCallback } from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import dataProvider from '../../dataProvider';
import { uniqueID } from '../../utils/utils';

const useImageLoader = (user, simulations) => {
    const [interiors, setInteriors] = useState(null);
    const [userInteriors, setUserInteriors] = useState(null);
    const [allInteriors, setAllInteriors] = useState(null);
    const [images, setImages] = useState(null);

    const userInteriorIsUsed = useCallback((userInteriorUrl) => {
        // Check is any simulation contains the current background
        return simulations.findIndex((simulation) => simulation.background === userInteriorUrl) === -1;
    }, [simulations]);

    const buildImageFromUrl = useCallback((url, uploaded) => {
        return {
            src: url,
            id: uniqueID(),
            uploaded: uploaded,
            deletable: true
        }
    }, []);

    const buildImagesFromUrls = useCallback((urls, uploaded) => {
        return urls.map((url) => buildImageFromUrl(url, uploaded));
    }, [buildImageFromUrl]);

    // Load interiors
    useEffect(() => {
        dataProvider.getInteriors().then(values => {
            unstable_batchedUpdates(() => {
                const defaultInteriors = buildImagesFromUrls(values, false);
                setInteriors(defaultInteriors);
            });
        })
    }, [buildImagesFromUrls]);

    // Load user uploaded interiors
    useEffect(() => {
        const loadPromise =
            user === null ?
            Promise.resolve([]) :
            dataProvider.getUploadedInteriors();
        
        loadPromise.then(values => {
            unstable_batchedUpdates(() => {
                const userInteriors = buildImagesFromUrls(values, true);
                setUserInteriors(userInteriors);
            });
        })
    }, [user, buildImagesFromUrls]);

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

    // Load image selection = home slideshow ?
    useEffect(() => {
        dataProvider.getInteriors().then(interiors => {
            setImages(interiors.map(interior => {
                return {
                    src: interior,
                    id: uniqueID()
                }
            }));
        })
    }, []);

    const addUploadedInterior = useCallback((fileSrc) => {
        // Add the new uploaded image to the user interiors' array
        setUserInteriors(prevInteriors => [
           buildImageFromUrl(fileSrc, true),
           ...prevInteriors
        ]);
    }, [buildImageFromUrl]);

    const deleteUploadedInterior = useCallback((fileUrl) => {
        setUserInteriors(prevInteriors => {
            return prevInteriors.filter(interior => interior.src !== fileUrl);
        });
    }, []);

    return [
        allInteriors,
        images,
        addUploadedInterior,
        deleteUploadedInterior
    ];
}

export default useImageLoader;