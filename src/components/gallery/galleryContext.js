import React from 'react';

const GalleryContext = React.createContext(null);

export const GalleryContextProvider = ({ options, children }) => {
    return (
        <GalleryContext.Provider value={options}>
            {children}
        </GalleryContext.Provider>
    );
};

export function useGalleryContext() {
    return React.useContext(GalleryContext); // Might be null or undefined
}
