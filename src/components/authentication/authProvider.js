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
                    // Transform the favorites array as a Set
                    const dataCopy = {...userData};
                    dataCopy.favorites = new Set(dataCopy.favorites);
                    console.log("context onlogon");
                    console.log(dataCopy)
                    setUserContext({
                        user: newUser,
                        data: dataCopy
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