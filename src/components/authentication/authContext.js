import React from 'react';

const AuthContext = React.createContext({
    user: null,
    data: null,
    admin: false
});

export default AuthContext;