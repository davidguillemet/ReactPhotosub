import React, { useState, useEffect, useCallback } from 'react';
import AuthContext from './authContext';
import { useGlobalContext } from '../globalContext/GlobalContext';
import { useQueryClient } from 'react-query';

const imagePath = (image) => `${image.path}/${image.name}`

const AuthProvider = ({ children }) => {

    const context = useGlobalContext();
    const queryClient = useQueryClient();
    const addFavorite = context.useAddFavorite();
    const removeFavorite = context.useRemoveFavorite();

    const addUserFavorite = useCallback(favoriteImg => {

        const path = imagePath(favoriteImg);
        addFavorite.mutateAsync(path).then(() => {
            setUserContext(prevUserContext => {
                // Create new map by adding the new favorite
                const newMap = new Map(prevUserContext.data.favorites);
                newMap.set(path, favoriteImg);

                // Set the new query data
                queryClient.setQueryData(['favorites', prevUserContext.user.uid], Array.from(newMap.values()))

                // Set the new state
                return {
                    ...prevUserContext,
                    data: {
                        ...prevUserContext.data,
                        favorites: newMap
                    }
                };
            });
        });

    }, [addFavorite, queryClient])

    const removeUserFavorite = useCallback(favoriteImg => {

        const path = imagePath(favoriteImg);
        removeFavorite.mutateAsync(path).then(() => {
            setUserContext(prevUserContext => {
                // Create new map by removing the favorite
                const newMap = new Map(prevUserContext.data.favorites);
                newMap.delete(path);

                // Set the new query data
                queryClient.setQueryData(['favorites', prevUserContext.user.uid], Array.from(newMap.values()))

                // Set the new state
                return {
                    ...prevUserContext,
                    data: {
                        ...prevUserContext.data,
                        favorites: newMap
                    }
                };
            });
        })

    }, [removeFavorite, queryClient])

    const initializeFavorites = useCallback(favorites => {
        const favMap = favorites.reduce((acc, current) => { acc.set(imagePath(current), current); return acc; }, new Map());
        setUserContext(prevUserContext => {
            return {
                ...prevUserContext,
                data: {
                    favorites: favMap
                }
            };
        });
    }, [])

    const [userContext, setUserContext] = useState({
        user: context.firebase.auth().currentUser,
        data: null,
        addUserFavorite: addUserFavorite,
        removeUserFavorite: removeUserFavorite,
    });

    const { data: favorites } = context.useFetchFavorites(userContext.user && userContext.user.uid, true);

    useEffect(() => {
        const unregisterAuthObserver = context.firebase.auth().onAuthStateChanged(user => {
            setUserContext(prevUserContext => {
                return {
                    ...prevUserContext,
                    user: user,
                    data: null
                };
            });
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [context.firebase]);

    useEffect(() => {
        if (favorites !== undefined) {
            initializeFavorites(favorites)
        }
    }, [initializeFavorites, favorites])

    return (
        <AuthContext.Provider value={userContext}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;