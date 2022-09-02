import React from 'react';
import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator, signOut } from "firebase/auth";
import { getStorage, connectStorageEmulator, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import { getAnalytics, logEvent } from "firebase/analytics";

import FirebaseContext from './firebaseContext';

const firebaseApp = initializeApp({
    apiKey: "AIzaSyALeWHQ-CKzvcG-sb7466UNzFDn_w5HQOc",
    authDomain: "photosub.firebaseapp.com",
    projectId: "photosub",
    storageBucket: "photosub.appspot.com",
    messagingSenderId: "780806748384",
    appId: "1:780806748384:web:c2976014be05cc21a13885",
    measurementId: "G-NNE3P3R7HH"
});

const firebaseAuth = getAuth(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);
const firebaseAnalytics = getAnalytics(firebaseApp);

const isDev = process.env.NODE_ENV === "development";

const storageHost = isDev ? "http://localhost:9199" : "https://storage.googleapis.com";
if (isDev) {
    connectAuthEmulator(firebaseAuth, "http://localhost:9099");
    connectStorageEmulator(firebaseStorage, "localhost", 9199);
}

const firebaseContext = {
    auth: firebaseAuth,
    signOut: () => {
        signOut(firebaseAuth);
    },
    storage: firebaseStorage,
    storageHost,
    storageBucket: firebaseStorage.app.options.storageBucket,
    storageRef: (path) => {
        return ref(firebaseStorage, path);
    },
    upload: (ref, file, metadata) => {
        return uploadBytesResumable(ref, file, metadata)
    },
    getDownloadURL: getDownloadURL,
    logEvent:
        isDev ?
        () => { } : // Empty function on dev context 
        (event, properties) => {
            logEvent(firebaseAnalytics, event, properties);
        } 
}

const FirebaseProvider = ({children}) => {
    return (
        <FirebaseContext.Provider value={firebaseContext}>
            {children}
        </FirebaseContext.Provider>
    );
}

export default FirebaseProvider;