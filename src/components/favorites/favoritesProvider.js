import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuthContext } from '../authentication';
import { useGlobalContext } from '../globalContext';
import FavoritesContext from './favoritesContext';

const imagePath = (image) => `${image.path}/${image.name}`

const FavoritesProvider = ({ children }) => {

    const context = useGlobalContext();
    const authContext = useAuthContext();

    const addFavorite = context.useAddFavorite();
    const removeFavorite = context.useRemoveFavorite();
    const favoritesObservers = useRef([]);

    const [favorites, setFavorites] = useState(null);

    const addUserFavorite = useCallback(favoriteImgArray => {

        const pathArray = favoriteImgArray.map(img => imagePath(img));
        return addFavorite.mutateAsync(pathArray).then(() => {
            setFavorites(prevFavorites => {
                // Create new map by adding the new favorite
                const newMap = new Map(prevFavorites);
                favoriteImgArray.forEach((favoriteImg, index) => newMap.set(pathArray[index], favoriteImg));

                // Set the new query data
                context.queryClient.setQueryData(['favorites', authContext.user.uid], Array.from(newMap.values()))

                // Set the new state
                return newMap;
            });
            favoritesObservers.current.forEach(observer => observer(favoriteImgArray, 'add'));
        });

    }, [addFavorite, context, authContext.user])

    const removeUserFavorite = useCallback(favoriteImg => {

        const path = imagePath(favoriteImg);
        return removeFavorite.mutateAsync(path).then(() => {
            setFavorites(prevFavorites => {
                // Create new map by removing the favorite
                const newMap = new Map(prevFavorites);
                newMap.delete(path);

                // Set the new query data
                context.queryClient.setQueryData(['favorites', authContext.user.uid], Array.from(newMap.values()))

                // Set the new state
                return newMap;
            });
            favoritesObservers.current.forEach(observer => observer([favoriteImg], 'remove'));
        })

    }, [removeFavorite, context, authContext.user])

    const subscribeFavorites = useCallback((fn) => {
        favoritesObservers.current.push(fn);
    }, []);

    const unsubscribeFavorites = useCallback((fn) => {
        favoritesObservers.current = favoritesObservers.current.filter(observer => observer !== fn);
    }, []);

    const isInFavorites = useCallback((image) => {
        return (favorites && favorites.has(imagePath(image)));
    }, [favorites])

    useEffect(() => {
        if (authContext.user) {
            context.dataProvider.getUserData().then((userData) => {
                const favMap = userData.favorites.reduce((acc, current) => { acc.set(imagePath(current), current); return acc; }, new Map());        
                // Initialize query data for favorites
                context.queryClient.setQueryData(['favorites', authContext.user.uid], Array.from(favMap.values()));
                setFavorites(favMap)
            });
        } else {
            setFavorites(null)
        }
    }, [authContext.user, context]);

    return (
        <FavoritesContext.Provider value={{
            isIn: isInFavorites,
            addUserFavorite: addUserFavorite,
            removeUserFavorite: removeUserFavorite,
            subscribeFavorites: subscribeFavorites,
            unsubscribeFavorites: unsubscribeFavorites,
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export default FavoritesProvider;