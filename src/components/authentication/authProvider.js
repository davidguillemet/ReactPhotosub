import React, { useState, useEffect, useCallback } from 'react';
import AuthContext from './authContext';
import { useGlobalContext } from '../globalContext/GlobalContext';

const AuthProvider = ({ children }) => {

    const context = useGlobalContext();

    const updateUserContext = useCallback((user, userData) => {
        // Transform the favorites array as a Set
        setUserContext(prevUserContext => {
            const newUsercontext = {
                ...prevUserContext,
                user: user,
                data: userData
            };
            if (userData !== null) {
                newUsercontext.data.favorites = new Set(userData.favorites);
            }
            return newUsercontext;
        });
    }, []);

    const updateUserFavorites = useCallback(favorites => {
        setUserContext(prevUserContext => {
            return {
                ...prevUserContext,
                data: {
                    ...prevUserContext.data,
                    favorites: new Set(favorites)
                }
            };
        });
    }, []);

    const [userContext, setUserContext] = useState({
        user: context.firebase.auth().currentUser,
        data: null,
        updateUserContext: updateUserContext,
        updateUserFavorites: updateUserFavorites
    });

    useEffect(() => {
        const unregisterAuthObserver = context.firebase.auth().onAuthStateChanged(newUser => {

            if (newUser === null) {
                updateUserContext(null, null);
            } else {
                newUser.getIdToken().then(token => {
                    return context.dataProvider.getUserData(newUser.uid);
                }).then(userData => {
                    updateUserContext(newUser, userData);
                });
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [updateUserContext, context.dataProvider, context.firebase]);

    return (
        <AuthContext.Provider value={userContext}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;