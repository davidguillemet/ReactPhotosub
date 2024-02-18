import React from 'react';

const GalleryContext = React.createContext(null);

export const GalleryContextProvider = ({destination, images, galleries, children}) => {

    const galleryContext = {
        destination,
        images,
        galleries
    };

    return (
        <GalleryContext.Provider value={galleryContext}>
          { children }
        </GalleryContext.Provider>
    )
}

export function useGalleryContext() {
    const context = React.useContext(GalleryContext);
    if (context === undefined || context === null) {
        throw new Error("useGalleryContext must be used within an GalleryContextProvider");
    }
    return context;
}
