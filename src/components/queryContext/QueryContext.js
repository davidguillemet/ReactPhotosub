import React, { createContext, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataProvider } from '../dataProvider/dataManagerProvider';
import { useFirebaseContext } from '../firebase';
import { CheckErrorsAfterAddImage, CheckErrorsAfterRemoveImage } from 'common/GlobalErrors';
import { isDestinationPath } from 'utils';

const DESTINATION_PROPS = {
    HEADER: "header",
    DESC: "desc",
    IMAGES: "images",
    GALLERIES: "galleries"
};

const DESTINATION_QUERY_BASE_KEY = "destination";

const getFetchDestinationKey = (path, props) => {
    return [
        DESTINATION_QUERY_BASE_KEY,
        path,
        props
    ];
};

// A destination key is like [ "destination", "<year>/<title>", "<props>" ]
const isDestinationKey = (queryKey, path) => {
    return  queryKey.length >= 3 &&
            queryKey[0] === DESTINATION_QUERY_BASE_KEY &&
            queryKey[1] === path;
            // We could also check the props is defined as DESTINATION_PROPS property...
}

const QueryContext = createContext(null);

export const QueryContextProvider = ({children}) => {

    const firebaseContext = useFirebaseContext();
    const dataProvider = useDataProvider();
    const queryClient = useQueryClient();

    const getUser = () => firebaseContext.auth.currentUser;
    const userId = () => getUser().uid
    const addDestinationImage = (newImage) => {
        const queryKey = getFetchDestinationKey(newImage.path, DESTINATION_PROPS.IMAGES);
        const prevData = queryClient.getQueryData(queryKey);
        // We might upload the same image again or just update image properties,
        // in which case we must replace the image in the data
        const imageIndex = prevData.findIndex(img => newImage.name === img.name && newImage.path === img.path);
        if (imageIndex === -1) {
            // New image
            prevData.push(newImage);
        } else {
            // Upload again an existing image / Update image properties
            prevData.splice(imageIndex, 1, newImage);
        }
        queryClient.setQueryData(queryKey, [...prevData]);

        const prevImageFolders = queryClient.getQueryData(['imageFolders']);
        if (prevImageFolders.findIndex(folder => folder.path === newImage.path) === -1) {
            queryClient.setQueryData(['imageFolders'], [...prevImageFolders, {path: newImage.path}]);
        }

        const prevImageErrors = queryClient.getQueryData(['imageErrors']);
        const newImageErrors = CheckErrorsAfterAddImage(prevImageErrors, newImage);
        if (newImageErrors !== null) {
            queryClient.setQueryData(['imageErrors'], newImageErrors);
        }
    };

    const queryContext = useRef({
        invalidateDestinations: async () => {
            const mainKeyForDestinations = [
                "destinations", //
                "related",
                DESTINATION_QUERY_BASE_KEY
            ];
            await queryClient.invalidateQueries({
                predicate: (query) => {
                    const invalidate = mainKeyForDestinations.includes(query.queryKey[0]);
                    return invalidate;
                },
                refetchType: 'all'
            });
        },
        useFetchHomeSlideshow: () => useQuery(['homeslideshow'], () => dataProvider.getImageDefaultSelection()),
        useFetchLocations: () => useQuery(['locations'], () => dataProvider.getLocations()), 
        useFetchRegions: () => useQuery(['regions'], () => dataProvider.getRegions()),
        useFetchDestinations: () => useQuery(['destinations'], () => dataProvider.getDestinations()),

        // Destinations
        useAddDestination: () => useMutation((destination) => dataProvider.createDestination(destination), {
            onSuccess: (data) => {
                queryClient.setQueryData(['destinations'], data)
            }
        }),
        useDeleteDestination: () => useMutation((destination) => dataProvider.deleteDestination(destination.id), {
            onSuccess: ({id}, destination) => {
                if (id !== destination.id) {
                    throw new Error("Mismatching destination ids...");
                }
                const prevDestinations = queryClient.getQueryData(['destinations']);
                const newDestinations = prevDestinations.filter(d => d.id !== destination.id);
                queryClient.setQueryData(['destinations'], newDestinations);
                queryClient.invalidateQueries({
                    // Invalidate all queries related to destination path "year/title"
                    predicate: (query) => {
                        const shouldInvalidated = isDestinationKey(query.queryKey, destination.path);
                        return shouldInvalidated;
                    },
                    refetchType: 'all'
                })
            }
        }),
        useUpdateDestination: () => useMutation((destination) => dataProvider.updateDestination(destination), {
            onSuccess: ({data}, destination) => {
                queryClient.setQueryData(['destinations'], data);
                queryClient.invalidateQueries({
                    // Invalidate all queries related to destination path "year/title"
                    predicate: (query) => {
                        const shouldInvalidated = isDestinationKey(query.queryKey, destination.path);
                        return shouldInvalidated;
                    },
                    refetchType: 'all'
                })
            }
        }),

        // Locations
        useAddLocation: () => useMutation((location) => dataProvider.createLocation(location), {
            onSuccess: (data) => {
                queryClient.setQueryData(['locations'], data)
            }
        }),
        useDeleteLocation: () => useMutation((location) => dataProvider.deleteLocation(location.id), {
            onSuccess: ({id}) => {
                const prevLocations = queryClient.getQueryData(['locations']);
                const newLocations = prevLocations.filter(l => l.id !== id);
                queryClient.setQueryData(['locations'], newLocations);
            }
        }),
        useUpdateLocation: () => useMutation((location) => dataProvider.updateLocation(location), {
            onSuccess: ({data}) => {
                queryClient.setQueryData(['locations'], data)
            }
        }),

        // Image properties
        useUpdateImageProperties: () => useMutation((image) => dataProvider.updateImageProperties(image), {
            onSuccess: (data) => {
                addDestinationImage(data);
            }
        }),

        useFetchRelatedDestinations: (regions, macro, wide) => useQuery(['related', ...regions, macro, wide], () => dataProvider.getRelatedDestinations(regions, macro, wide)),
        useFetchDestinationDesc: (destinationPath) => useQuery(getFetchDestinationKey(destinationPath, DESTINATION_PROPS.DESC), () => dataProvider.getDestinationDescFromPath(destinationPath)),
        useFetchDestinationHeader: (destinationPath) => useQuery(getFetchDestinationKey(destinationPath, DESTINATION_PROPS.HEADER), () => dataProvider.getDestinationDetailsFromPath(destinationPath)),

        useFetchDestinationImages: (destinationPath) => useQuery({
            queryKey: getFetchDestinationKey(destinationPath, DESTINATION_PROPS.IMAGES),
            queryFn: () => dataProvider.getDestinationImagesFromPath(destinationPath),
            enabled: isDestinationPath(destinationPath),
            structuralSharing: false // To force a refresh even if the data is the same after query invalidation (Image management in Admin)
        }),
        addDestinationImage,
        removeDestinationImage: (destinationPath, imageFullPath) => {
            const queryKey = getFetchDestinationKey(destinationPath, DESTINATION_PROPS.IMAGES);
            const prevData = queryClient.getQueryData(queryKey);
            const newData = prevData.filter(image => `${image.path}/${image.name}` !== imageFullPath);
            queryClient.setQueryData(queryKey, newData);

            const prevImageErrors = queryClient.getQueryData(['imageErrors']);
            const newImageErrors = CheckErrorsAfterRemoveImage(prevImageErrors, imageFullPath);
            if (newImageErrors !== null) {
                queryClient.setQueryData(['imageErrors'], newImageErrors);
            }
        },

        useFetchInteriors: (thenFunc) => useQuery(['interiors'], () => dataProvider.getInteriors().then(thenFunc)),
        useFetchUserInteriors: (uid, thenFunc) => useQuery(['userInteriors', uid], () => dataProvider.getUploadedInteriors(uid).then(thenFunc)),
        useRemoveUserInterior: () => useMutation((fileName) => dataProvider.removeUploadedInterior(fileName)),
        useFetchDefaultSelection: (enabled, thenFunc) => useQuery(
            ['defaultSelection'],
            () => dataProvider.getImageDefaultSelection().then(thenFunc),
            { enabled: enabled }
        ),
        useFetchSearchResults: (enabled, thenFunc) => useQuery(['searchResults'], () => Promise.resolve([]), { enabled: enabled }),

        useFetchSimulations: (uid) => useQuery(['simulations', uid], () => dataProvider.getSimulations(uid), {
            notifyOnChangePropsExclusions: ['data'] // Prevent re-render when data property changes (does ot work!)
        }),
        useAddSimulation: () => useMutation((newSimulation) => dataProvider.addSimulation(newSimulation), {
            onSuccess: (data, variables) => {
                queryClient.setQueryData(['simulations', userId()], data)
            }
        }),
        useUpdateSimulation: () => useMutation((simulation) => dataProvider.updateSimulation(simulation), {
            onSuccess: (data, variables) => {
                queryClient.setQueryData(['simulations', userId()], data)
            }
        }),
        useRemoveSimulation: () => useMutation((simulation) => dataProvider.removeSimulation(simulation), {
            onSuccess: (data, variables) => {
                queryClient.setQueryData(['simulations', userId()], data)
            }
        }),
        useFetchImageCount: () => useQuery(['imageCount'], () => dataProvider.getImageCount()),

        useFetchFavorites: (uid, enabled, thenFunc) => useQuery(['favorites', uid], () => dataProvider.getFavorites(uid).then(thenFunc), { enabled: enabled }),
        useAddFavorite: () => useMutation((pathArray) => dataProvider.addFavorite(pathArray)),
        useRemoveFavorite: () => useMutation((path) => dataProvider.removeFavorite(path)),
        setFavoritesData: (uid, favorites) => queryClient.setQueryData(['favorites', uid], favorites),

        useFetchImageFolders: () => useQuery(['imageFolders'], () => dataProvider.getImageFolders()),
        removeImageFolder: (folderPath) => {
            const queryKey = ['imageFolders'];
            const prevFolders = queryClient.getQueryData(queryKey);
            const newFolders = prevFolders.filter(folder => folder.path !== folderPath);
            queryClient.setQueryData(queryKey, newFolders)
        },

        useFetchImageErrors: () => useQuery(['imageErrors'], () => dataProvider.getImageErrors()),

        useFetchSubGalleries: (destination) => useQuery(getFetchDestinationKey(destination.path, DESTINATION_PROPS.GALLERIES), () => dataProvider.getDestinationSubGalleries(destination.id)),
        useAddSubGallery: () => useMutation(({subGallery, destination}) => dataProvider.createSubGallery(subGallery), {
            onSuccess: (data, {destination}) => {
                queryClient.setQueryData(getFetchDestinationKey(destination.path, DESTINATION_PROPS.GALLERIES), data);
            }
        }),
        useUpdateSubGallery: () => useMutation(({subGallery, destination}) => dataProvider.updateSubGallery(subGallery), {
            onSuccess: (data, {destination}) => {
                queryClient.setQueryData(getFetchDestinationKey(destination.path, DESTINATION_PROPS.GALLERIES), data);
            }
        }),
        useUpdateSubGalleryIndices: () => useMutation((updateInfos) => dataProvider.updateSubGalleryIndices(updateInfos), {
            onSuccess: (data, updateInfos) => {
                const destination = updateInfos.destination;
                queryClient.setQueryData(getFetchDestinationKey(destination.path, DESTINATION_PROPS.GALLERIES), data);
            }
        }),
        useUpdateSubGalleryImages: () => useMutation((updateInfos) => dataProvider.updateSubGalleryImages(updateInfos), {
            onSuccess: (data, updateInfos) => {
                const queryKey = getFetchDestinationKey(updateInfos.destination.path, DESTINATION_PROPS.IMAGES);
                const destinationImages = queryClient.getQueryData(queryKey);
                destinationImages.forEach(image => {
                    if (updateInfos.add && updateInfos.add.includes(image.id)) {
                        image.sub_gallery_id = updateInfos.galleryId;
                    } else if (updateInfos.remove && updateInfos.remove.includes(image.id)) {
                        image.sub_gallery_id = null;
                    }
                });
                queryClient.setQueryData(queryKey, [...destinationImages]);
            }
        }),
        useDeleteSubGallery: () => useMutation((group) => dataProvider.deleteSubGallery(group.gallery), {
            onSuccess: (data, group) => {
                const imagesQueryQuey = getFetchDestinationKey(group.destination.path, DESTINATION_PROPS.IMAGES);
                const destinationImages = queryClient.getQueryData(imagesQueryQuey);
                // Remove sub_gallery_id for impacted images
                // -> on backend side, it has been done automatically by postgresql (foreign key)
                destinationImages.forEach((image) => {
                    if (image.sub_gallery_id === group.gallery.id) {
                        image.sub_gallery_id = null;
                    }
                });
                queryClient.setQueryData(imagesQueryQuey, [...destinationImages]);
                queryClient.setQueryData(getFetchDestinationKey(group.destination.path, DESTINATION_PROPS.GALLERIES), data);
            }
        }),
        useFetchUsers: () => useQuery(['users'], () => dataProvider.getUsers()),
    });

    return (
        <QueryContext.Provider value={ queryContext.current }>
          { children }
        </QueryContext.Provider>
    )
};

export const useQueryContext = () => useContext(QueryContext)

