import React, { createContext, useRef } from 'react';

import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/storage";

import axios from 'axios';
import DataProvider from '../../dataProvider/dataprovider';

const GlobalContext = createContext(null);

export { GlobalContext };

const GlobalContextProvider = ({children}) => {

    const globalContext = useRef(null);

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
            timeout: 3000,
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
            dataProvider
        }
    }

    return (
        <GlobalContext.Provider value={ globalContext.current }>
          { children }
        </GlobalContext.Provider>
    )
};

export default GlobalContextProvider;
