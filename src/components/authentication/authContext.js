import React from 'react';

const AuthContext = React.createContext({
    user: null,
    data: null
});

export default AuthContext;