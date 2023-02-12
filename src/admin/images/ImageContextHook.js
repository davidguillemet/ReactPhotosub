import React from 'react';
import ImageContext from './ImageContext';

function useImageContext() {
    const context = React.useContext(ImageContext);
    if (context === undefined || context === null) {
        throw new Error("useImageContext must be used within an ImageContextProvider");
    }
    return context;
}

export default useImageContext;
