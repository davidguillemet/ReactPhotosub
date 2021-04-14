import React from 'react';
import AuthContext from './authContext';

function useAuthContext() {
    const context = React.useContext(AuthContext);
    if (context === undefined || context === null) {
        throw new Error("useAuthState must be used within a AuthProvider");
    }
    return context;
}

export default useAuthContext;
