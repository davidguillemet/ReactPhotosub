import React, { createContext, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataProvider } from '../dataProvider/dataManagerProvider';
import { useFirebaseContext } from '../firebase';
import { CheckErrorsAfterAddImage, CheckErrorsAfterRemoveImage } from 'common/GlobalErrors';
import { isDestinationPath } from 'utils';
import { setImageVersion } from 'utils/imageVersionRegistry';
import {
    getFetchDestinationKey,
    isDestinationKey,
    DESTINATION_PROPS,
    DESTINATION_QUERY_BASE_KEY
} from 'utils/destinations';

const QueryContext = createContext(null);

export const QueryContextProvider = ({children}) => {

    const firebaseContext = useFirebaseContext();
    const dataProvider = useDataProvider();
    const queryClient = useQueryClient();

    const getUser = () => firebaseContext.auth.currentUser;
    const userId = () => getUser().uid

    const addDestinationImage = React.useCallback((newImage) => {
        setImageVersion(newImage.src, newImage.version);
        const queryKey = getFetchDestinationKey(newImage.path, DESTINATION_PROPS.IMAGES);
        const prevData = queryClient.getQueryData(queryKey);
        const { images, galleries } = prevData;
        // We might upload the same image again or just update image properties,
        // in which case we must replace the image in the data
        const imageIndex = images.findIndex(img => newImage.name === img.name && newImage.path === img.path);
        if (imageIndex === -1) {
            // New image
            images.push(newImage);
        } else {
            // Upload again an existing image / Update image properties
            images.splice(imageIndex, 1, newImage);
        }
        queryClient.setQueryData(queryKey, { galleries, images: [...images] });

        const prevImageFolders = queryClient.getQueryData(['imageFolders']);
        if (prevImageFolders.findIndex(folder => folder.path === newImage.path) === -1) {
            queryClient.setQueryData(['imageFolders'], [...prevImageFolders, {path: newImage.path}]);
        }

        const prevImageErrors = queryClient.getQueryData(['imageErrors']);
        const newImageErrors = CheckErrorsAfterAddImage(prevImageErrors, newImage);
        if (newImageErrors !== null) {
            queryClient.setQueryData(['imageErrors'], newImageErrors);
        }
    }, [queryClient]);

    const queryContext = useRef({
        invalidateDestinations: async () => {
            const mainKeyForDestinations = [
                "destinations", //
                "related",
                DESTINATION_QUERY_BASE_KEY
            ];
            await queryClient.invalidateQueries({
                predicate: (query) => {
                    let invalidate = mainKeyForDestinations.includes(query.queryKey[0]);
                    if (invalidate && query.queryKey[0] === DESTINATION_QUERY_BASE_KEY) {
                        const destinationPath = query.queryKey[1];
                        if (!destinationPath) {
                            invalidate = false;
                        }
                    }
                    return invalidate;
                },
                refetchType: 'all'
            });
        },
        useFetchLocations: () => useQuery(['locations'], () => dataProvider.getLocations()), 
        useFetchRegions: () => useQuery(['regions'], () => dataProvider.getRegions()),

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

        // Regions
        useAddRegion: () => useMutation((region) => dataProvider.createRegion(region), {
            onSuccess: (data) => {
                queryClient.setQueryData(['regions'], data)
            }
        }),
        useDeleteRegion: () => useMutation((region) => dataProvider.deleteRegion(region.id), {
            onSuccess: ({id}) => {
                const prevRegions = queryClient.getQueryData(['regions']);
                const newRegions = prevRegions.filter(l => l.id !== id);
                queryClient.setQueryData(['regions'], newRegions);
            }
        }),
        useUpdateRegion: () => useMutation((region) => dataProvider.updateRegion(region), {
            onSuccess: ({data}) => {
                queryClient.setQueryData(['regions'], data)
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
            const { images, galleries } = prevData;
            const newData = { galleries, images: images.filter(image => `${image.path}/${image.name}` !== imageFullPath) };
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

        useFetchFavorites: (uid, collectionId, enabled, thenFunc) => useQuery(['favorites', uid, collectionId], () => dataProvider.getFavorites(uid, collectionId).then(thenFunc), { enabled: enabled }),
        useAddFavorite: () => useMutation(({pathArray, collectionId}) => dataProvider.addFavorite(pathArray, collectionId)),
        useRemoveFavorite: () => useMutation(({path, collectionId}) => dataProvider.removeFavorite(path, collectionId)),
        setFavoritesData: (uid, collectionId, favorites) => queryClient.setQueryData(['favorites', uid, collectionId], favorites),

        useCreateCollection: () => useMutation(({name_fr, name_en}) => dataProvider.createCollection(name_fr, name_en)), // eslint-disable-line camelcase
        useRenameCollection: () => useMutation(({id, name_fr, name_en}) => dataProvider.renameCollection(id, name_fr, name_en)), // eslint-disable-line camelcase
        useDeleteCollection: () => useMutation((id) => dataProvider.deleteCollection(id)),
        useSetActiveCollection: () => useMutation((id) => dataProvider.setActiveCollection(id)),
        useFetchUserCollections: (uid, enabled) => useQuery(['collections', uid], () => dataProvider.getCollectionsForUser(uid), { enabled: !!uid && enabled }),

        useFetchImageFolders: () => useQuery(['imageFolders'], () => dataProvider.getImageFolders()),
        removeImageFolder: (folderPath) => {
            const queryKey = ['imageFolders'];
            const prevFolders = queryClient.getQueryData(queryKey);
            const newFolders = prevFolders.filter(folder => folder.path !== folderPath);
            queryClient.setQueryData(queryKey, newFolders)
        },

        useFetchImageErrors: () => useQuery(['imageErrors'], () => dataProvider.getImageErrors()),

        useFetchUsers: () => useQuery(['users'], () => dataProvider.getUsers()),
    });

    return (
        <QueryContext.Provider value={ queryContext.current }>
          { children }
        </QueryContext.Provider>
    )
};

export const useQueryContext = () => useContext(QueryContext)

