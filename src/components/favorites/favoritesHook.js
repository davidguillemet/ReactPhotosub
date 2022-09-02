import React from 'react';
import FavoritesContext from './favoritesContext';

function useFavorites() {
    const context = React.useContext(FavoritesContext);
    if (context === undefined || context === null) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}

export default useFavorites;
