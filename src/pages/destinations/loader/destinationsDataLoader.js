import { defer } from "react-router-dom";

const destinationsQuery = (dataProvider) => ({
    queryKey: ['destinations'],
    queryFn: () => dataProvider.getDestinations()
});

const getDestinations = async (queryClient, dataProvider) => {
    const query = destinationsQuery(dataProvider);
    return queryClient.ensureQueryData(query);
};

const destinationsLoaderFactory = (queryClient, dataProvider) => async ({ request, params }) => {
    // when migrating to react-router V7, just remove the defer and return the promise directly from the loader,
    // react-router will automatically defer it and stream the response as the data is loaded,
    // no need to use defer in the loader itself. 
    return defer({
        destinations: getDestinations(queryClient, dataProvider)
    });
};

export const loaderFactory = destinationsLoaderFactory;