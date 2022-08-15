import { useContext } from 'react';
import { ToastContext } from './ToastContextProvider';

const withTimeout = (addToast, timeout, removeToast) => (toast) => {
    const toastObj = addToast(toast);
    let appliedTimeout = toast.timeout ?? timeout
    if (appliedTimeout > 0)
        setTimeout(() => removeToast(toastObj), appliedTimeout)
} 

const useToast = (timeout = 10000) => {
    const {removeToast, toast: originalToast} = useContext(ToastContext);

    const toast = {
       error: withTimeout(originalToast.error, timeout, removeToast),
       success: withTimeout(originalToast.success, timeout, removeToast),
       info: withTimeout(originalToast.info, timeout, removeToast),
       warning: withTimeout(originalToast.warning, timeout, removeToast),
    }

    return {removeToast, toast};
}

export const useToasts = () => {
    const { toasts } = useContext(ToastContext);

    return toasts;
}

export default useToast;
