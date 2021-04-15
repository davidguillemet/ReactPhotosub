import React, { useState, useEffect } from 'react';
import AuthContext from './authContext';
import { FirebaseApp } from '../firebase';
import dataProvider from '../../dataProvider';

const AuthProvider = ({ children }) => {
    const [userContext, setUserContext] = useState({
        user: FirebaseApp.auth().currentUser,
        data: null
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
                    setUserContext({
                        user: newUser,
                        data: userData
                    });
                });
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, []);

    return (
        <AuthContext.Provider value={userContext}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;