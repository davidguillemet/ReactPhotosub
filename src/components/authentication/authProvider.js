import React, { useState, useRef, useEffect, useCallback } from 'react';
import AuthContext from './authContext';
import { useGlobalContext } from '../globalContext/GlobalContext';

const imagePath = (image) => `${image.path}/${image.name}`

const AuthProvider = ({ children }) => {

    const context = useGlobalContext();
    const addFavorite = context.useAddFavorite();
    const removeFavorite = context.useRemoveFavorite();
    const observers = useRef([]);

    const addUserFavorite = useCallback(favoriteImgArray => {

        const pathArray = favoriteImgArray.map(img => imagePath(img));
        return addFavorite.mutateAsync(pathArray).then(() => {
            setUserContext(prevUserContext => {
                // Create new map by adding the new favorite
                const newMap = new Map(prevUserContext.data.favorites);
                favoriteImgArray.forEach((favoriteImg, index) => newMap.set(pathArray[index], favoriteImg));

                // Set the new query data
                context.queryClient.setQueryData(['favorites', prevUserContext.user.uid], Array.from(newMap.values()))

                // Set the new state
                return {
                    ...prevUserContext,
                    data: {
                        ...prevUserContext.data,
                        favorites: newMap
                    }
                };
            });
            observers.current.forEach(observer => observer(favoriteImgArray, 'add'));
        });

    }, [addFavorite, context])

    const removeUserFavorite = useCallback(favoriteImg => {

        const path = imagePath(favoriteImg);
        return removeFavorite.mutateAsync(path).then(() => {
            setUserContext(prevUserContext => {
                // Create new map by removing the favorite
                const newMap = new Map(prevUserContext.data.favorites);
                newMap.delete(path);

                // Set the new query data
                context.queryClient.setQueryData(['favorites', prevUserContext.user.uid], Array.from(newMap.values()))

                // Set the new state
                return {
                    ...prevUserContext,
                    data: {
                        ...prevUserContext.data,
                        favorites: newMap
                    }
                };
            });
            observers.current.forEach(observer => observer([favoriteImg], 'remove'));
        })

    }, [removeFavorite, context])

    const subscribeFavorites = useCallback((fn) => {
        observers.current.push(fn);
    }, []);

    const unsubscribeFavorites = useCallback((fn) => {
        observers.current = observers.current.filter(observer => observer !== fn);
    }, []);

    const [userContext, setUserContext] = useState({
        user: context.firebase.auth().currentUser,
        data: null,
        admin: false,
        addUserFavorite: addUserFavorite,
        removeUserFavorite: removeUserFavorite,
        subscribeFavorites: subscribeFavorites,
        unsubscribeFavorites: unsubscribeFavorites
    });

    useEffect(() => {
        const unregisterAuthObserver = context.firebase.auth().onAuthStateChanged(async (user) => {

            if (user) { // user is signed in

                const idTokenResult = await context.firebase.auth().currentUser.getIdTokenResult();
                context.dataProvider.getUserData()
                .then((userData) => {

                    const favMap = userData.favorites.reduce((acc, current) => { acc.set(imagePath(current), current); return acc; }, new Map());        
                    // Initialize query data for favorites
                    context.queryClient.setQueryData(['favorites', user.uid], userData.favorites);
                    setUserContext(prevUserContext => {
                        return {
                            ...prevUserContext,
                            user: user,
                            data: {
                                favorites: favMap
                            },
                            admin: idTokenResult.claims.roles && idTokenResult.claims.roles.includes("admin")
                        };
                    });
                });
            } else { // user is signed out
                setUserContext(prevUserContext => {
                    return {
                        ...prevUserContext,
                        user: null,
                        data: {
                            favorites: null
                        },
                        admin: false
                    };
                });
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [context]);

    return (
        <AuthContext.Provider value={userContext}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;