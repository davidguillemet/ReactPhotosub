import React, { useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

const DarkModeContext = React.createContext(undefined);

export const DarkModeProvider = ({ children }) => {

    const systemDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    // eslint-disable-next-line no-unused-vars
    const [darkModeOverride, setDarkModeOverride] = useState(systemDarkMode);

    useEffect(() => {
        setDarkModeOverride(systemDarkMode);
    }, [systemDarkMode])

    return (
        <DarkModeContext.Provider value={{
            darkMode: true, // darkModeOverride,
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
