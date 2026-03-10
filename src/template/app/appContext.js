import React from 'react';
import { useLocation } from "react-router-dom";

const AppContext = React.createContext(null);

export const AppContextProvider = ({ children }) => {

    const location = useLocation();
    const historySubscriptions = React.useRef(new Map());
    const subscribeHistory = React.useCallback((key, func) => {
        historySubscriptions.current.set(key, func);
    }, []);
    const unsubscribeHistory = React.useCallback((key) => {
        historySubscriptions.current.delete(key);
    }, []);
    const callHistoryObservers = React.useCallback((loc) => {
        // [...xxx.values()] otherwise it does not work on mobile...
        [...historySubscriptions.current.values()].forEach(fn => fn(loc));
    }, []);

    // Effect called on location change, to notify all subscribers
    React.useEffect(() => {
        callHistoryObservers(location);
    }, [location, callHistoryObservers]);

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    return (
        <AppContext.Provider
            value={{
                drawerOpen,
                setDrawerOpen,
                subscribeHistory,
                unsubscribeHistory
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export function useAppContext() {
    return React.useContext(AppContext); // Might be null or undefined
}
