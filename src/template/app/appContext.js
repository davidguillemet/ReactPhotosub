import React from 'react';
import { useHistory } from "react-router-dom";

const AppContext = React.createContext(null);

export const AppContextProvider = ({ children }) => {

    const history = useHistory();
    const historySubscriptions = React.useRef(new Map());
    const subscribeHistory = React.useCallback((key, func) => {
        historySubscriptions.current.set(key, func);
    }, []);
    const unsubscribeHistory = React.useCallback((key) => {
        historySubscriptions.current.delete(key)
    }, []);
    const callHistoryObservers = React.useCallback((location) => {
        historySubscriptions.current.values().forEach(fn => fn(location));
    }, []);

    React.useEffect(() => {
        history.listen((location, action) => {
            callHistoryObservers(location);
        });
    }, [history, callHistoryObservers]);

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
