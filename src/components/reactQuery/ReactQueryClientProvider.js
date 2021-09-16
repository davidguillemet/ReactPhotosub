import {
    QueryClient,
    QueryClientProvider,
} from 'react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchIntervalInBackground: false
        },
    },
});

const ReactQueryClientProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
};

export default ReactQueryClientProvider;