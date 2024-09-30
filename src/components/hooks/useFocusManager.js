import React from 'react';

const useFocusManager = () => {

    const [ isOnFocus, setIsOnFocus ] = React.useState(true);

    const onFocus = React.useCallback(() => {
        setIsOnFocus(true);
    }, []);
    const onBlur = React.useCallback(() => {
        setIsOnFocus(false);
    }, []);

    React.useEffect(() => {
        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);
        // Specify how to clean up after this effect:
        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
        };
    }, [onFocus, onBlur]);

    return {
        focus: isOnFocus
    };
};

export default useFocusManager;