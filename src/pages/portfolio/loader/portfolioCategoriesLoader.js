import { PORTFOLIO_CATEGORIES_KEY } from 'utils/portfolio';

const categoriesQuery = (dataProvider) => ({
    queryKey: PORTFOLIO_CATEGORIES_KEY,
    queryFn: () => dataProvider.getPortfolioCategories()
});

const getPortfolioCategories = async (queryClient, dataProvider) => {
    const query = categoriesQuery(dataProvider);
    return queryClient.ensureQueryData(query);
};

const categoriesLoaderFactory = (queryClient, dataProvider) => async ({ request, params }) => {
    return {
        categories: getPortfolioCategories(queryClient, dataProvider)
    };
};

export const loaderFactory = categoriesLoaderFactory;