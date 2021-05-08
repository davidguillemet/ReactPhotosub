import React, { useState, useEffect, useCallback } from 'react';
import AuthContext from './authContext';
import { FirebaseApp } from '../firebase';
import dataProvider from '../../dataProvider';

const AuthProvider = ({ children }) => {

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
        user: FirebaseApp.auth().currentUser,
        data: null,
        updateUserContext: updateUserContext,
        updateUserFavorites: updateUserFavorites
    });

    useEffect(() => {
        const unregisterAuthObserver = FirebaseApp.auth().onAuthStateChanged(newUser => {

            if (newUser === null) {
                updateUserContext(null, null);
            } else {
                newUser.getIdToken().then(token => {
                    return dataProvider.getUserData(newUser.uid);
                }).then(userData => {
                    updateUserContext(newUser, userData);
                });
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [updateUserContext]);

    return (
        <AuthContext.Provider value={userContext}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;