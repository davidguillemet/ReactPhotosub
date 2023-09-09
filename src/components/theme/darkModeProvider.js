import React, { useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

const DarkModeContext = React.createContext(undefined);

export const DarkModeProvider = ({ children }) => {

    const systemDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkModeOverride, setDarkModeOverride] = useState(/*undefined*/systemDarkMode);

    useEffect(() => {
        setDarkModeOverride(systemDarkMode);
    }, [systemDarkMode])

    return (
        <DarkModeContext.Provider value={{
            darkMode: /*darkModeOverride !== undefined ? darkModeOverride : */darkModeOverride,
            systemDarkMode: systemDarkMode,
            setDarkMode: setDarkModeOverride
        }}>
            {children}
        </DarkModeContext.Provider>
    )
}

export function useDarkMode() {
    const context = React.useContext(DarkModeContext);
    if (context === undefined || context === null) {
        throw new Error("useDarkMode must be used within a DarkModeProvider");
    }
    return context;
}
