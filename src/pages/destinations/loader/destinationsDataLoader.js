
const destinationsQuery = (dataProvider) => ({
    queryKey: ['destinations'],
    queryFn: () => dataProvider.getDestinations()
});

const getDestinations = async (queryClient, dataProvider) => {
    const query = destinationsQuery(dataProvider);
    return queryClient.ensureQueryData(query);
};

const destinationsLoaderFactory = (queryClient, dataProvider) => async ({ request, params }) => {
    return{
        destinations: getDestinations(queryClient, dataProvider)
    };
};

export const loaderFactory = destinationsLoaderFactory;