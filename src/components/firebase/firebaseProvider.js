import React from 'react';
import { initializeApp } from "firebase/app"
// import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "firebase/app-check";
import { getAuth, connectAuthEmulator, signOut } from "firebase/auth";
import {
    getStorage,
    connectStorageEmulator,
    ref,
    list,
    deleteObject,
    uploadBytesResumable,
    uploadString,
    getDownloadURL
} from "firebase/storage";
import { getAnalytics, logEvent } from "firebase/analytics";

import FirebaseContext from './firebaseContext';
// import { useToast } from '../notifications';

const firebaseApp = initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "photosub.firebaseapp.com",
    projectId: "photosub",
    storageBucket: "photosub.appspot.com",
    messagingSenderId: "780806748384",
    appId: "1:780806748384:web:c2976014be05cc21a13885",
    measurementId: "G-NNE3P3R7HH"
});

const isDev = process.env.NODE_ENV === "development";
// if (isDev) {
//     window.self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
// }

// const appCheck = initializeAppCheck(firebaseApp, {
//     provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_V3_SITE_KEY),
//     isTokenAutoRefreshEnabled: true
// });

const firebaseAuth = getAuth(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);
const firebaseAnalytics = isDev ? null : getAnalytics(firebaseApp);

const storageHost = isDev ? "http://localhost:9199" : "https://storage.googleapis.com";
if (isDev) {
    connectAuthEmulator(firebaseAuth, "http://localhost:9099");
    connectStorageEmulator(firebaseStorage, "localhost", 9199);
}

const _ghostFileName = ".ghost";

const FirebaseProvider = ({children}) => {
    // const { toast } = useToast();

    // const getAppCheckToken = React.useCallback(async () => {
    //     try {
    //         const appCheckTokenResponse = await getToken(appCheck, /* forceRefresh= */ false);
    //         return appCheckTokenResponse.token;
    //     } catch (err) {
    //         toast.error(err.message);
    //         return "";
    //     }
    // }, [toast]);

    const firebaseContext = React.useRef({
        auth: firebaseAuth,
        //getAppCheckToken,
        signOut: () => {
            signOut(firebaseAuth);
        },
        storage: firebaseStorage,
        rootPublicUrl: `${storageHost}/${firebaseStorage.app.options.storageBucket}`,
        storageRef: (path) => {
            return ref(firebaseStorage, path);
        },
        deleteItems: (items) => {
            const promises = items.map(itemFullPath => {
                return deleteObject(ref(firebaseStorage, itemFullPath));
            })
            return Promise.all(promises);
        },
        list: (ref, options) => {
            return list(ref, options);
        },
        upload: (ref, file, metadata) => {
            return uploadBytesResumable(ref, file, metadata)
        },
        createFolder: (currentFolderRef, folder) => {
            const ghostFileRef = ref(firebaseStorage, `${currentFolderRef.fullPath}/${folder}/${_ghostFileName}`);
            return uploadString(ghostFileRef, "empty file", "raw", { contentType: "text/plain" })
            .then(ghostFile => {
                // Return the created folder (parent of ghost file)
                return ghostFile.ref.parent;
            })
        },
        isGhostFile: (item) => item.name === _ghostFileName,
        getDownloadURL: getDownloadURL,
        logEvent:
            isDev ?
            () => { } : // Empty function on dev context 
            (event, properties) => {
                logEvent(firebaseAnalytics, event, properties);
            } 
    });

    return (
        <FirebaseContext.Provider value={firebaseContext.current}>
            {children}
        </FirebaseContext.Provider>
    );
}

export default FirebaseProvider;