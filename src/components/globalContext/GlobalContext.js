import React, { createContext, useContext, useRef } from 'react';

import firebase from 'firebase/app';
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";

import axios from 'axios';
import DataProvider from '../../dataProvider/dataprovider';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const GlobalContext = createContext(null);

function userId() {
    return firebase.auth().currentUser.uid;
}

const GlobalContextProvider = ({children}) => {

    const globalContext = useRef(null);
    const queryClient = useQueryClient();
    const analytics = useRef(null);

    const isDev = () => {
        return process.env.NODE_ENV === "development"
    }

    // With React.StrictMode - to detet issues - it seems the App is rendered twice
    // but the globalContent ref is lost since it is not the same App instn-ance
    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyALeWHQ-CKzvcG-sb7466UNzFDn_w5HQOc",
            authDomain: "photosub.firebaseapp.com",
            projectId: "photosub",
            storageBucket: "photosub.appspot.com",
            messagingSenderId: "780806748384",
            appId: "1:780806748384:web:c2976014be05cc21a13885",
            measurementId: "G-NNE3P3R7HH"
        });
    }

    if (globalContext.current === null) {

        analytics.current = 
            isDev() ?
            {
                logEvent: () => { /* Empty */ }
            } :
            firebase.analytics();

        const storageHost = isDev() ? "http://localhost:9199" : "https://storage.googleapis.com";
        const firebaseAuth = firebase.auth();
        const firebaseStorage = firebase.storage();
        if (isDev()) {
            firebaseAuth.useEmulator("http://localhost:9099");
            firebaseStorage.useEmulator("localhost", 9199);
        }

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
            const currentUSer = firebaseAuth.currentUser;
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
            firebase,
            firebaseAuth,
            firebaseStorage,
            storageHost,
            firebaseAnalytics: analytics.current,
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

