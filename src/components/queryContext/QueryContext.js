import React, { createContext, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataProvider } from '../dataProvider/dataManagerProvider';
import { useFirebaseContext } from '../firebase';

const QueryContext = createContext(null);

export const QueryContextProvider = ({children}) => {

    const firebaseContext = useFirebaseContext();
    const dataProvider = useDataProvider();
    const queryClient = useQueryClient();

    const getUser = () => firebaseContext.auth.currentUser;
    const userId = () => getUser().uid

    const queryContext = useRef({
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
            onSuccess: ({id}) => {
                const prevDestinations = queryClient.getQueryData(['destinations']);
                const newDestinations = prevDestinations.filter(d => d.id !== id);
                queryClient.setQueryData(['destinations'], newDestinations);
            }
        }),
        useUpdateDestination: () => useMutation((destination) => dataProvider.updateDestination(destination), {
            onSuccess: ({data}) => {
                queryClient.setQueryData(['destinations'], data)
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

        useFetchRelatedDestinations: (regions, macro, wide) => useQuery(['related', ...regions, macro, wide], () => dataProvider.getRelatedDestinations(regions, macro, wide)),
        useFetchDestinationDesc: (year, title) => useQuery(['destinationdesc', year, title], () => dataProvider.getDestinationDescFromPath(year, title)),
        useFetchDestinationHeader: (year, title) => useQuery(['destinationheader', year, title], () => dataProvider.getDestinationDetailsFromPath(year, title)),

        useFetchDestinationImages: (year, title) => useQuery({
            queryKey: ['destinationimages', year, title],
            queryFn: () => dataProvider.getDestinationImagesFromPath(year, title),
            enabled: year !== null && year !== undefined && title !== null && title !== undefined,
            structuralSharing: false // To force a refresh even if the data is the same after query invalidation (Image management in Admin)
        }),
        addDestinationImage: (year, title, newImage) => {
            const queryKey = ['destinationimages', year, title];
            const prevData = queryClient.getQueryData(queryKey);
            prevData.push(newImage);
            queryClient.setQueryData(queryKey, [...prevData]);

            const prevImageFolders = queryClient.getQueryData(['imageFolders']);
            const newImageFolder = `${year}/${title}`
            if (prevImageFolders.findIndex(folder => folder.path === newImageFolder) === -1) {
                queryClient.setQueryData(['imageFolders'], [...prevImageFolders, {path: newImageFolder}]);
            }
        },
        removeDestinationImage: (year, title, imageFullPath) => {
            const queryKey = ['destinationimages', year, title];
            const prevData = queryClient.getQueryData(queryKey);
            const newData = prevData.filter(image => `${image.path}/${image.name}` !== imageFullPath);
            queryClient.setQueryData(queryKey, newData);
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
        removeImageFolder: (year, title) => {
            const queryKey = ['imageFolders'];
            const prevFolders = queryClient.getQueryData(queryKey);
            const folderToRemove = `${year}/${title}`
            const newFolders = prevFolders.filter(folder => folder.path !== folderToRemove);
            queryClient.setQueryData(queryKey, newFolders)
        }
    });

    return (
        <QueryContext.Provider value={ queryContext.current }>
          { children }
        </QueryContext.Provider>
    )
};

export const useQueryContext = () => useContext(QueryContext)

