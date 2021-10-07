import React, { createContext, useContext, useRef } from 'react';

import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/storage";

import axios from 'axios';
import DataProvider from '../../dataProvider/dataprovider';

import { useQuery, useMutation, useQueryClient } from 'react-query';

const GlobalContext = createContext(null);

function userId() {
    return firebase.auth().currentUser.uid;
}

const GlobalContextProvider = ({children}) => {

    const globalContext = useRef(null);
    const queryClient = useQueryClient();

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
        const apiBaseUrl =
            process.env.REACT_APP_USE_FUNCTIONS_EMULATOR === 'true' ?
            'http://localhost:5001/photosub/us-central1/mainapi':
            '';

        const axiosInstance = axios.create({
            baseURL: apiBaseUrl + '/api',
            timeout: 10000,
        });
        
        // configure axios to send an authentication token as soon as a user is connected
        axiosInstance.interceptors.request.use(async function (config) {
            if (firebase.auth().currentUser) {
                const token = await firebase.auth().currentUser.getIdToken(false);
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        const dataProvider = new DataProvider(axiosInstance);

        globalContext.current = {
            firebase,
            dataProvider,
            useFetchHomeSlideshow: () => useQuery('homeslideshow', () => dataProvider.getImageDefaultSelection()),
            useFetchLocations: (enabled, thenFunc) => useQuery('locations', () => dataProvider.getLocations().then(thenFunc), { enabled: enabled }), 
            useFetchRegions: () => useQuery('regions', () => dataProvider.getRegions()),
            useFetchDestinations: () => useQuery('destinations', () => dataProvider.getDestinations()),
            useFetchDestinationHeader: (year, title) => useQuery(['destinationheader', year, title], () => dataProvider.getDestinationDetailsFromPath(year, title)),
            useFetchDestinationImages: (year, title) => useQuery(['destinationimages', year, title], () => dataProvider.getDestinationImagesFromPath(year, title)),
            useFetchInteriors: (thenFunc) => useQuery('interiors', () => dataProvider.getInteriors().then(thenFunc)),
            useFetchUserInteriors: (uid, thenFunc) => useQuery(['userInteriors', uid], () => dataProvider.getUploadedInteriors(uid).then(thenFunc)),
            useRemoveUserInterior: () => useMutation((fileName) => dataProvider.removeUploadedInterior(fileName)),
            useFetchDefaultSelection: (enabled, thenFunc) => useQuery('defaultSelection', () => dataProvider.getImageDefaultSelection().then(thenFunc), { enabled: enabled }),
            useFetchSearchResults: (enabled, thenFunc) => useQuery('searchResults', () => Promise.resolve([]), { enabled: enabled }),

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
            useFetchImageCount: () => useQuery('imageCount', () => dataProvider.getImageCount()),

            useFetchFavorites: (uid, enabled, thenFunc) => useQuery(['favorites', uid], () => dataProvider.getFavorites(uid).then(thenFunc), { enabled: enabled }),
            useAddFavorite: () => useMutation((pathArray) => dataProvider.addFavorite(pathArray)),
            useRemoveFavorite: () => useMutation((path) => dataProvider.removeFavorite(path))
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

