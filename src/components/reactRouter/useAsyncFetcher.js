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
            setIsLoading(true);
            setPendingPromise({ resolve, reject });
            fetcher.submit(submitData, options);
        });
    }, [fetcher, action]);

    React.useEffect(() => {
        if (fetcher.state === 'idle' && pendingPromise) {
            setIsLoading(false);
            if (fetcher.data?.error) {
                pendingPromise.reject(fetcher.data.error);
            } else {
                pendingPromise.resolve(fetcher.data);
            }
            setPendingPromise(null);
        }
    }, [fetcher.state, fetcher.data, pendingPromise])

    return { submit: asyncSubmit, isLoading, fetcher };
};
