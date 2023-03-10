import axios from 'axios';
import React from 'react';
import { useFirebaseContext } from 'components/firebase';
import DataProvider from 'dataProvider';

const DataManagerContext = React.createContext(null);

const isDev = () => {
    return process.env.NODE_ENV === "development"
}

const apiBaseUrl =
    process.env.REACT_APP_USE_FUNCTIONS_EMULATOR === 'true' ?
    'http://localhost:5003/photosub/us-central1/mainapi':
    '';

const createAxiosInstance = (firebaseContext) => {

    const getUser = () => firebaseContext.auth.currentUser;

    const axiosInstance = axios.create({
        baseURL: apiBaseUrl + '/api',
        timeout: isDev() ? 1200000 /* 20mn in case of debug */ : 10000 /* 10s */,
    });

    axiosInstance.defaults.headers = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
    };

    // configure axios to send an authentication token as soon as a user is connected
    axiosInstance.interceptors.request.use(async function (config) {
        const currentUSer = getUser();
        if (currentUSer) {
            const token = await currentUSer.getIdToken(true);
            config.headers.Authorization = `Bearer ${token}`;
        }
        // const appCheckToken = await firebaseContext.getAppCheckToken();
        // config.headers['X-Firebase-AppCheck'] = appCheckToken;
        return config;
    });

    // Error handling interceptor
    axiosInstance.interceptors.response.use(
        res => res,
        err => {
            if (err.response && err.response.status === 500 && err.response.data?.error) {
                // response content should look like { error: { code: "...", message: "..." } }
                if (err.response.data.error.code === "auth/id-token-revoked") {
                    firebaseContext.signOut();
                    return;
                }
                throw new Error(err.response.data.error.message, { cause: err.response.data?.error });
            }
            throw err;
        }
    );

    return new DataProvider(axiosInstance);
}

export const DataManagerProvider = ({children}) => {
    const firebaseContext = useFirebaseContext();
    const dataProvider = React.useMemo(() => createAxiosInstance(firebaseContext), [firebaseContext]);

    return (
        <DataManagerContext.Provider value={dataProvider} >
            {children}
        </DataManagerContext.Provider>
    )
};

export function useDataProvider() {
    const context = React.useContext(DataManagerContext);
    if (context === undefined || context === null) {
        throw new Error("useDataProvider must be used within a dataManagerProvider");
    }
    return context;
}

