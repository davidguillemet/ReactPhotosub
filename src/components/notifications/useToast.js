
import React from 'react';
import { ToastContext } from './ToastContextProvider';

const useToast = () => {
    const context = React.useContext(ToastContext);
    if (context === undefined || context === null) {
        throw new Error("useToast must be used within a ToastContextProvider");
    }
    return context;
}

export const useToasts = () => {
    const context = React.useContext(ToastContext);
    if (context === undefined || context === null) {
        throw new Error("useToasts must be used within a ToastContextProvider");
    }
    const { toasts } = context;
    return toasts;
}

export default useToast;
