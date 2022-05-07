import React from 'react';

const AuthContext = React.createContext({
    user: undefined,
    data: null,
    admin: false
});

export default AuthContext;