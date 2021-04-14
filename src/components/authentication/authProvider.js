import React, { useState, useEffect } from 'react';
import AuthContext from './authContext';
import { FirebaseApp } from '../firebase';

const AuthProvider = ({ children }) => {
    const [userContext, setUserContext] = useState({
        user: FirebaseApp.auth().currentUser,
        data: null
    });

    useEffect(() => {
        const unregisterAuthObserver = FirebaseApp.auth().onAuthStateChanged(newUser => {
            const data = null; // TODO: if user is not null, het user data
            setUserContext({
                user: newUser,
                data: data
            });
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