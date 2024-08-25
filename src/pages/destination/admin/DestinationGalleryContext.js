import React from 'react';

const DestinationGalleryContext = React.createContext(null);

export const DestinationGalleryContextProvider = ({destination, images, galleries, children}) => {

    const galleryContext = {
        destination,
        images,
        galleries
    };

    return (
        <DestinationGalleryContext.Provider value={galleryContext}>
          { children }
        </DestinationGalleryContext.Provider>
    )
}

export function useDestinationGalleryContext() {
    const context = React.useContext(DestinationGalleryContext);
    if (context === undefined || context === null) {
        throw new Error("useDestinationGalleryContext must be used within an DestinationGalleryContextProvider");
    }
    return context;
}
