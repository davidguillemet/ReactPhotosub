import React, { useState, useEffect } from 'react';
import AuthContext from './authContext';
import { FirebaseApp } from '../firebase';
import dataProvider from '../../dataProvider';

const AuthProvider = ({ children }) => {
    const [userContext, setUserContext] = useState({
        user: FirebaseApp.auth().currentUser,
        data: null,
        updateUserContext: updateUserContext
    });

    useEffect(() => {
        const unregisterAuthObserver = FirebaseApp.auth().onAuthStateChanged(newUser => {

            if (newUser === null) {
                setUserContext({
                    user: null,
                    data: null
                });
            } else {
                newUser.getIdToken().then(token => {
                    return dataProvider.getUserData(newUser.uid);
                }).then(userData => {
                    updateUserContext(newUser, userData);
                });
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function updateUserContext(user, userData) {
        // Transform the favorites array as a Set
        setUserContext({
            user: user,
            data: {
                favorites: new Set(userData.favorites),
            },
            updateUserContext: updateUserContext
        });
    }

    return (
        <AuthContext.Provider value={userContext}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;