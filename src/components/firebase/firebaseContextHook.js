import React from 'react';
import FirebaseContext from './firebaseContext';

function useFirebaseContext() {
    const context = React.useContext(FirebaseContext);
    if (context === undefined || context === null) {
        throw new Error("useFirebaseContext must be used within a FirebaseProvider");
    }
    return context;
}

export default useFirebaseContext;
