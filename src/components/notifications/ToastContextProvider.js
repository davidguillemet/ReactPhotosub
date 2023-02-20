import React, { useState, useCallback } from 'react';

export const ToastContext = React.createContext({
    toasts: [],
    toast: {
        success: () => {},
        error: () => {},
        warning: () => {},
        info: () => {},
    },
    removeToast: () => {},
});

const id = (toast) => toast.__id;

const ToastContextProvider = ({children}) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(toast => {
        const newToast =
            typeof toast === 'string' ?
            { message: toast} :
            toast;
        if (newToast.__id == null) newToast.__id = new Date();
        setToasts(toasts => [...toasts, newToast]);
        return newToast;
    }, []);

    const removeToast = useCallback(toast => {
        setToasts(toastList => toastList.filter(current => id(current) !== id(toast)));
    }, []);

    const toast = React.useRef({
        error: (msg) => addToast({message: msg, type: 'error'}),
        success: (msg) => addToast({message: msg, type: 'success'}),
        warning: (msg) => addToast({message: msg, type: 'warning'}),
        info: (msg) => addToast({message: msg, type: 'info'})
    });

    const contextValue = {
        toasts,
        removeToast,
        toast: toast.current
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
        </ToastContext.Provider>
    );
}

export default ToastContextProvider;