import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential } from "firebase/auth";
import AuthContext from './authContext';
import { useFirebaseContext } from '../firebase';
import { useToast } from '../notifications';

const AuthProvider = ({ children }) => {

    const firebaseContext = useFirebaseContext();
    const { toast } = useToast();
    const userObservers = useRef([]);

    const registerUserObserver = useCallback((userObserver) => {
        userObservers.current.push(userObserver);
        return () => userObservers.current = userObservers.current.filter(obs => obs !== userObserver)
    }, []);

    const reloadUser = useCallback(() => {
        return firebaseContext.auth.currentUser.reload()
        .then(() => {
            userObservers.current.forEach(observer => observer())
        })
    }, [firebaseContext.auth.currentUser])

    const reauthenticateWithCredentialIndirection = useCallback((email, password) => {
        const credential = EmailAuthProvider.credential(email, password);
        return reauthenticateWithCredential(firebaseContext.auth.currentUser, credential);
    }, [firebaseContext.auth.currentUser]);

    const [userContext, setUserContext] = useState({
        user: undefined,
        admin: false,
        reloadUser: reloadUser,
        registerUserObserver: registerUserObserver,
        reauthenticateWithCredential: reauthenticateWithCredentialIndirection
    });

    useEffect(() => {
        const unregisterAuthObserver = onAuthStateChanged(firebaseContext.auth, async (user) => {

            if (user) { // user is signed in

                firebaseContext.auth.currentUser.getIdTokenResult(true)
                .then((idTokenResult) => {
                    setUserContext(prevUserContext => {
                        return {
                            ...prevUserContext,
                            user: user,
                            admin: idTokenResult.claims.roles && idTokenResult.claims.roles.includes("admin")
                        };
                    });

                    firebaseContext.logEvent("login", {
                        method: EmailAuthProvider.PROVIDER_ID
                    });
                }).catch(error => {
                    if (error.cause?.code === "auth/id-token-revoked")
                    {
                        // https://firebase.google.com/docs/auth/admin/manage-sessions#detect_id_token_revocation_in_the_sdk
                        // Token has been revoked. Inform the user to reauthenticate or signOut() the user
                        firebaseContext.signOut();
                        return;
                    } else {
                        toast.error(error.message);
                        setUserContext(prevUserContext => {
                            return {
                                ...prevUserContext,
                                user: user,
                                admin: false
                            };
                        });
                    }
                });
            } else { // user is signed out
                setUserContext(prevUserContext => {
                    return {
                        ...prevUserContext,
                        user: null,
                        admin: false
                    };
                });
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [firebaseContext, toast]);

    return (
        <AuthContext.Provider value={userContext}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;