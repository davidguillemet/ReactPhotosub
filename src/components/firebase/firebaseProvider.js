import React from 'react';
import { initializeApp } from "firebase/app"
import { getRemoteConfig, getValue, fetchAndActivate } from "firebase/remote-config";

import {
    applyActionCode,
    getAuth,
    connectAuthEmulator,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset,
    deleteUser,
    signOut
} from "firebase/auth";
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
import { useLanguage } from 'utils';

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

const remoteConfig = getRemoteConfig(firebaseApp);
// Set the minimum fetch interval to 30s for development to allow immediate reflection of changes in the Firebase console, and to 10mn for production to optimize performance and reduce costs. See https://firebase.google.com/docs/remote-config/use-config-web#fetch_and_activate_values for more details.
remoteConfig.settings.minimumFetchIntervalMillis = isDev ? 30000 : 600000;
remoteConfig.defaultConfig = {
    "portfolio_enabled": isDev ? "true" : "false"
};

let configFetched = false;
let configFetchPromise = null;

const ensureConfigFetched = () => {
    // In dev, skip the fetch so defaultConfig values are always used — the Firebase console
    // value would override them otherwise, making dev/prod behave identically.
    // In prod, fetch once and cache the result; concurrent callers await the same promise
    // to avoid duplicate requests. On fetch error, fall back silently to defaultConfig.
    if (isDev || configFetched) return Promise.resolve();
    if (!configFetchPromise) {
        configFetchPromise = fetchAndActivate(remoteConfig)
            .catch(() => {})
            .finally(() => {
                configFetched = true;
                configFetchPromise = null;
            });
    }
    return configFetchPromise;
};

const firebaseAuth = getAuth(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);
const firebaseAnalytics = isDev ? null : getAnalytics(firebaseApp);

const storageHost = isDev ? `http://${process.env.REACT_APP_DEV_HOST}:9199` : "https://storage.googleapis.com";
if (isDev) {
    connectAuthEmulator(firebaseAuth, `http://${process.env.REACT_APP_DEV_HOST}:9099`);
    connectStorageEmulator(firebaseStorage, process.env.REACT_APP_DEV_HOST, 9199);
}

const _ghostFileName = ".ghost";

const FirebaseProvider = ({children}) => {
    const { language } = useLanguage();

    React.useEffect(() => {
        firebaseAuth.languageCode = language;
    }, [language])

    const firebaseContext = React.useRef({
        auth: firebaseAuth,
        //getAppCheckToken,
        signOut: () => {
            signOut(firebaseAuth);
        },
        signIn: (email, password) => {
            return signInWithEmailAndPassword(firebaseAuth, email, password);
        },
        sendEmailVerification: () => {
            return sendEmailVerification(firebaseAuth.currentUser);
        },
        sendPasswordResetEmail: (email) => {
            return sendPasswordResetEmail(firebaseAuth, email);
        },
        verifyPasswordResetCode: (actionCode) => {
            return verifyPasswordResetCode(firebaseAuth, actionCode);
        },
        confirmPasswordReset: (actionCode, newPassword) => {
            return confirmPasswordReset(firebaseAuth, actionCode, newPassword);
        },
        applyActionCode: (actionCode) => {
            return applyActionCode(firebaseAuth, actionCode);
        },
        deleteUser: () => {
            return deleteUser(firebaseAuth.currentUser);
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
            },
        getConfigValue: async (key) => {
            await ensureConfigFetched();
            return getValue(remoteConfig, key);
        }
    });

    return (
        <FirebaseContext.Provider value={firebaseContext.current}>
            {children}
        </FirebaseContext.Provider>
    );
}

export default FirebaseProvider;