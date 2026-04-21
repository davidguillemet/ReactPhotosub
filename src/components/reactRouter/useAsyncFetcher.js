import React from 'react';
import { useFetcher } from 'react-router';

export const useAsyncFetcher = (fetcherKey, action = null) => {
    const fetcher = useFetcher({ key: fetcherKey });
    const [isLoading, setIsLoading] = React.useState(false);
    const [pendingPromise, setPendingPromise] = React.useState(null);

    const asyncSubmit = React.useCallback((submitData) => {
        return new Promise((resolve, reject) => {
            const optionsBase = { method: "post", encType: "application/json" };
            const options = action ? { ...optionsBase, action } : optionsBase;
            fetcher.submit(submitData, options);
            setIsLoading(true);
            setPendingPromise({ resolve, reject });
        });
    }, [fetcher, action]);

    React.useEffect(() => {
        if (fetcher.state === 'idle' && pendingPromise) {
            setIsLoading(false);
            pendingPromise.resolve();
            setPendingPromise(null);
        }
    }, [fetcher.state, pendingPromise])

    React.useEffect(() => {
        if (fetcher.data) {
            // run alert from here
        }
    }, [fetcher.data]);

    return { submit: asyncSubmit, isLoading, fetcher };
};
