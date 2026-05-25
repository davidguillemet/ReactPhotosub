import React, { createContext, useCallback, useContext, useState } from 'react';

const DetailsContext = createContext(null);

export const DetailsProvider = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const toggleCollapsed = useCallback(() => setCollapsed(prev => !prev), []);
    return (
        <DetailsContext.Provider value={{ collapsed, toggleCollapsed }}>
            {children}
        </DetailsContext.Provider>
    );
};

export const useDetailsState = () => useContext(DetailsContext);
