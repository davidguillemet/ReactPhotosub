import React from 'react';
import { useLocation } from "react-router-dom";

export const useQueryParameter = () => {
    const location = useLocation();

    const getQueryParameter = React.useCallback((parameter) => {
        const queryParameters = new URLSearchParams(location.search);
        return queryParameters.get(parameter);
    }, [location]);

    return getQueryParameter;
}
