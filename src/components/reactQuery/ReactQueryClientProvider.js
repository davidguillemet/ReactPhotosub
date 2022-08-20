import { useRef } from 'react';
import {
    QueryClient,
    QueryClientProvider,
    QueryCache,
    MutationCache
} from '@tanstack/react-query';

import { useToast } from '../notifications';

const ReactQueryClientProvider = ({ children }) => {
    const { toast } = useToast();

    const queryClientRef = useRef(new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchIntervalInBackground: false,
                retry: (failureCount, error) => {
                    // Don't retry for 404
                    if (error.response && error.response.status === 404) {
                        return false;
                    }
                    return false; //failureCount < 3;
                }
            }
        },
        queryCache: new QueryCache({
            onError: (error, query) => {
                // Display a toast with the error message
                toast.error(error.message);
                console.error(error);
            },
            onSuccess: (data) => {
                // Empty
            }
        }),
        mutationCache: new MutationCache({
            onError: (error) => {
                toast.error(error.message);
                console.error(error);
            },
            onSuccess: data => {
                // Empty
            },
        })
    }));

    return (
        <QueryClientProvider client={queryClientRef.current}>
            {children}
        </QueryClientProvider>
    )
};

export default ReactQueryClientProvider;