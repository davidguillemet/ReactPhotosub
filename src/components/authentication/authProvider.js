import React, { useState, useRef, useEffect, useCallback } from 'react';
import AuthContext from './authContext';
import { useGlobalContext } from '../globalContext/GlobalContext';

const imagePath = (image) => `${image.path}/${image.name}`

const AuthProvider = ({ children }) => {

    const context = useGlobalContext();
    const addFavorite = context.useAddFavorite();
    const removeFavorite = context.useRemoveFavorite();
    const favoritesObservers = useRef([]);
    const userObservers = useRef([]);

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
            favoritesObservers.current.forEach(observer => observer(favoriteImgArray, 'add'));
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
            favoritesObservers.current.forEach(observer => observer([favoriteImg], 'remove'));
        })

    }, [removeFavorite, context])

    const subscribeFavorites = useCallback((fn) => {
        favoritesObservers.current.push(fn);
    }, []);

    const unsubscribeFavorites = useCallback((fn) => {
        favoritesObservers.current = favoritesObservers.current.filter(observer => observer !== fn);
    }, []);

    const registerUserObserver = useCallback((userObserver) => {
        userObservers.current.push(userObserver);
        return () => userObservers.current = userObservers.current.filter(obs => obs !== userObserver)
    }, []);

    const reloadUser = useCallback(() => {
        return context.firebaseAuth.currentUser.reload()
        .then(() => {
            userObservers.current.forEach(observer => observer())
        })
    }, [context.firebaseAuth])

    const reauthenticateWithCredential = useCallback((email, password) => {
        const credential = context.firebase.auth.EmailAuthProvider.credential(email, password);
        return context.firebaseAuth.currentUser.reauthenticateWithCredential(credential);
    }, [context.firebase, context.firebaseAuth.currentUser]);

    const [userContext, setUserContext] = useState({
        user: undefined,
        data: null,
        admin: false,
        addUserFavorite: addUserFavorite,
        removeUserFavorite: removeUserFavorite,
        subscribeFavorites: subscribeFavorites,
        unsubscribeFavorites: unsubscribeFavorites,
        reloadUser: reloadUser,
        registerUserObserver: registerUserObserver,
        reauthenticateWithCredential: reauthenticateWithCredential
    });

    useEffect(() => {
        const unregisterAuthObserver = context.firebaseAuth.onAuthStateChanged(async (user) => {

            if (user) { // user is signed in

                const idTokenResult = await context.firebaseAuth.currentUser.getIdTokenResult(true);
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

                    context.firebaseAnalytics.logEvent("login", {
                        method: context.firebase.auth.EmailAuthProvider.PROVIDER_ID
                    });
                }).catch(error => {
                    if (error.cause?.code === "auth/id-token-revoked")
                    {
                        // https://firebase.google.com/docs/auth/admin/manage-sessions#detect_id_token_revocation_in_the_sdk
                        // Token has been revoked. Inform the user to reauthenticate or signOut() the user
                        context.firebaseAuth.signOut();
                        return;
                    }
                    console.error("error while getting user data", error);
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