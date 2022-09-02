import React, { createContext, useContext, useRef } from 'react';

import axios from 'axios';
import DataProvider from '../../dataProvider/dataprovider';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirebaseContext } from '../firebase';

const GlobalContext = createContext(null);

const isDev = () => {
    return process.env.NODE_ENV === "development"
}

const GlobalContextProvider = ({children}) => {

    const firebaseContext = useFirebaseContext();
    const globalContext = useRef(null);
    const queryClient = useQueryClient();

    const getUser = () => firebaseContext.auth.currentUser;
    const userId = () => getUser().uid

    if (globalContext.current === null) {

        const apiBaseUrl =
            process.env.REACT_APP_USE_FUNCTIONS_EMULATOR === 'true' ?
            'http://localhost:5003/photosub/us-central1/mainapi':
            '';

        const axiosInstance = axios.create({
            baseURL: apiBaseUrl + '/api',
            timeout: isDev() ? 1200000 /* 20mn in case of debug */ : 10000 /* 10s */,
        });

        // configure axios to send an authentication token as soon as a user is connected
        axiosInstance.interceptors.request.use(async function (config) {
            const currentUSer = getUser();
            if (currentUSer) {
                const token = await currentUSer.getIdToken(true);
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Error handling interceptor
        axiosInstance.interceptors.response.use(
            res => res,
            err => {
                if (err.response && err.response.status === 500 && err.response.data?.error) {
                    // response content should look like { error: { code: "...", message: "..." } }
                    throw new Error(err.response.data.error.message, { cause: err.response.data?.error });
                }
                throw err;
            }
        );

        const dataProvider = new DataProvider(axiosInstance);

        globalContext.current = {
            dataProvider,
            queryClient,
            useFetchHomeSlideshow: () => useQuery(['homeslideshow'], () => dataProvider.getImageDefaultSelection()),
            useFetchLocations: () => useQuery(['locations'], () => dataProvider.getLocations()), 
            useFetchRegions: () => useQuery(['regions'], () => dataProvider.getRegions()),
            useFetchDestinations: () => useQuery(['destinations'], () => dataProvider.getDestinations()),
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
            useFetchRelatedDestinations: (regions, macro, wide) => useQuery(['related', ...regions, macro, wide], () => dataProvider.getRelatedDestinations(regions, macro, wide)),
            useFetchDestinationDesc: (year, title) => useQuery(['destinationdesc', year, title], () => dataProvider.getDestinationDescFromPath(year, title)),
            useFetchDestinationHeader: (year, title) => useQuery(['destinationheader', year, title], () => dataProvider.getDestinationDetailsFromPath(year, title)),
            useFetchDestinationImages: (year, title) => useQuery(['destinationimages', year, title], () => dataProvider.getDestinationImagesFromPath(year, title)),
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

            useFetchImageFolders: () => useQuery(['imageFolders'], () => dataProvider.getImageFolders())
        }
    }

    return (
        <GlobalContext.Provider value={ globalContext.current }>
          { children }
        </GlobalContext.Provider>
    )
};

export default GlobalContextProvider;
export { GlobalContext };
export const useGlobalContext = () => useContext(GlobalContext)

