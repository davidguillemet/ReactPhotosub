const portfolioQuery = (dataProvider) => ({
    queryKey: ['portfolio'],
    queryFn: () => dataProvider.getPortfolio()
});

const getPortfolio = async (queryClient, dataProvider) => {
    const query = portfolioQuery(dataProvider);
    return queryClient.ensureQueryData(query);
}

const getAppData = async (queryClient, dataProvider) => {
    const [portfolio] = await Promise.all([
        getPortfolio(queryClient, dataProvider)
    ]);
    return {
        portfolio
    };
}

const AppRootDataLoader = (queryClient, dataProvider) => async ({ request, params }) => {
    return {
        appData: getAppData(queryClient, dataProvider)
    };
};

export const loaderFactory = AppRootDataLoader;